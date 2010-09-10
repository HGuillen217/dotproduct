/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.sprites.Player');

goog.require('goog.events');
goog.require('dotprod.Camera');
goog.require('dotprod.input.Keyboard');
goog.require('dotprod.layers.MapLayer');
goog.require('dotprod.layers.ProjectileLayer');
goog.require('dotprod.sprites.Bullet');
goog.require('dotprod.sprites.Sprite');
goog.require('dotprod.Vector');

/**
 * @constructor
 * @extends {dotprod.sprites.Sprite}
 * @param {!dotprod.Game} game
 * @param {!dotprod.Camera} camera
 * @param {!dotprod.layers.MapLayer} mapLayer
 * @param {string} name
 */
dotprod.sprites.Player = function(game, camera, mapLayer, projectileLayer, name) {
  dotprod.sprites.Sprite.call(this);

  /**
   * @type {!dotprod.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!Object}
   * @private
   */
  this.settings_ = game.getConfig().getSettings();

  /**
   * @type {!dotprod.layers.MapLayer}
   * @private
   */
  this.mapLayer_ = mapLayer;

  /**
   * @type {!dotprod.layers.ProjectileLayer}
   * @private
   */
  this.projectileLayer_ = projectileLayer;

  /**
   * @type {string}
   * @private
   */
  this.name_ = name;

  /**
   * @type {number}
   * @private
   */
  this.ship_ = 0;

  /**
   * @type {!dotprod.Vector}
   * @private
   */
  this.velocity_ = new dotprod.Vector(0, 0);

  /**
   * @type {!dotprod.TiledImage}
   * @private
   */
  this.image_ = game.getResourceManager().getTiledImage('ship' + this.ship_);

  /**
   * @type {number}
   * @private
   */
  this.angleInRadians_ = 0;

  /**
   * @type {!dotprod.Camera} camera
   * @private
   */
  this.camera_ = camera;

  /**
   * @type {number}
   * @private
   */
  this.projectileFireTime_ = 0;

  this.setShip(0);
};
goog.inherits(dotprod.sprites.Player, dotprod.sprites.Sprite);

/**
 * @param {number} ship
 */
dotprod.sprites.Player.prototype.setShip = function(ship) {
  this.x_ = 8192;
  this.y_ = 8192;
  this.xRadius_ = this.settings_['ships'][this.ship_]['xRadius'];
  this.yRadius_ = this.settings_['ships'][this.ship_]['yRadius'];
  this.ship_ = ship;
  this.image_ = this.game_.getResourceManager().getTiledImage('ship' + this.ship_);
};

/**
 * @param {number} timeDiff
 */
dotprod.sprites.Player.prototype.update = function(timeDiff) {
  var shipSettings = this.settings_['ships'][this.ship_];
  var shipRotation = shipSettings['rotationRadiansPerTick'];
  var shipSpeed = shipSettings['speedPixelsPerTick'];
  var acceleration = shipSettings['accelerationPerTick'];
  var bounceFactor = shipSettings['bounceFactor'];

  var keyboard = this.game_.getKeyboard();
  var dimensions = this.camera_.getDimensions();
  var now = goog.now();

  if (keyboard.isKeyPressed(goog.events.KeyCodes.CTRL)) {
    if (now - this.projectileFireTime_ > 300) {
      var front = new dotprod.Vector(0, -this.yRadius_).rotate(this.angleInRadians_).add(new dotprod.Vector(this.x_, this.y_));
      var velocity = this.velocity_.add(dotprod.Vector.fromPolar(3, this.angleInRadians_));
      this.projectileLayer_.addProjectile(this.name_, new dotprod.sprites.Bullet(this.mapLayer_, front.getX(), front.getY(), velocity));
      this.projectileFireTime_ = now;
    }
  }

  if (keyboard.isKeyPressed(goog.events.KeyCodes.LEFT)) {
    this.angleInRadians_ -= timeDiff * shipRotation;
  } else if (keyboard.isKeyPressed(goog.events.KeyCodes.RIGHT)) {
    this.angleInRadians_ += timeDiff * shipRotation;
  }

  if (this.angleInRadians_ < 0 || this.angleInRadians_ >= Math.PI * 2) {
    this.angleInRadians_ -= Math.floor(this.angleInRadians_ / (2 * Math.PI)) * 2 * Math.PI;
  }

  if (keyboard.isKeyPressed(goog.events.KeyCodes.UP)) {
    this.velocity_ = this.velocity_.add(dotprod.Vector.fromPolar(acceleration * timeDiff, this.angleInRadians_));
  } else if (keyboard.isKeyPressed(goog.events.KeyCodes.DOWN)) {
    this.velocity_ = this.velocity_.subtract(dotprod.Vector.fromPolar(acceleration * timeDiff, this.angleInRadians_));
  }

  // Magnitude of speed is greater than maximum ship speed - clamp.
  var magnitude = this.velocity_.magnitude();
  if (magnitude >= shipSpeed) {
    this.velocity_ = this.velocity_.scale(shipSpeed / magnitude);
  }

  this.x_ += this.velocity_.getX() * timeDiff;
  var collisionRect = this.mapLayer_.getCollision(this);
  if (collisionRect) {
    var xVel = this.velocity_.getX();
    this.x_ = xVel >= 0 ? collisionRect.left : collisionRect.right;
    this.velocity_ = new dotprod.Vector(-xVel * bounceFactor, this.velocity_.getY());
  }

  this.y_ += this.velocity_.getY() * timeDiff;
  collisionRect = this.mapLayer_.getCollision(this);
  if (collisionRect) {
    var yVel = this.velocity_.getY();
    this.y_ = yVel >= 0 ? collisionRect.top : collisionRect.bottom;
    this.velocity_ = new dotprod.Vector(this.velocity_.getX(), -yVel * bounceFactor);
  }

  this.camera_.setPosition(Math.floor(this.x_), Math.floor(this.y_));
};

/**
 * @param {!dotprod.Camera} camera
 */
dotprod.sprites.Player.prototype.render = function(camera) {
  var tileNum = Math.floor(this.angleInRadians_ / (2 * Math.PI) * this.image_.getNumTiles());
  var dimensions = camera.getDimensions();
  var context = camera.getContext();

  var x = Math.floor((dimensions.width - this.image_.getTileWidth()) / 2);
  var y = Math.floor((dimensions.height - this.image_.getTileHeight()) / 2);

  this.image_.render(context, x, y, tileNum);

  context.save();
    context.font = '12pt Verdana';
    context.fillStyle = 'rgb(200, 200, 200)';
    context.textAlign = 'center';
    context.fillText(this.name_, dimensions.width / 2, dimensions.height / 2 + this.image_.getTileHeight());
  context.restore();
};
