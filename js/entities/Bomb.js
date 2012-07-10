/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Bomb');

goog.require('dotprod.Camera');
goog.require('dotprod.entities.Effect');
goog.require('dotprod.entities.Projectile');
goog.require('dotprod.model.Weapon.Type');
goog.require('dotprod.Vector');

/**
 * @constructor
 * @extends {dotprod.entities.Projectile}
 * @param {!dotprod.Game} game
 * @param {!dotprod.entities.Player} owner
 * @param {number} level
 * @param {!dotprod.Vector} position
 * @param {!dotprod.Vector} velocity
 * @param {number} lifetime
 * @param {number} damage
 * @param {number} bounceCount
 */
dotprod.entities.Bomb = function(game, owner, level, position, velocity, lifetime, damage, bounceCount) {
  dotprod.entities.Projectile.call(this, game, owner, level, lifetime, damage);

  this.position_ = position;
  this.velocity_ = velocity;

  /**
   * @type {!dotprod.Animation}
   * @private
   */
  this.animation_ = game.getResourceManager().getVideoEnsemble('bombs').getAnimation(level);
  this.animation_.setRepeatCount(-1);

  /**
   * @type {number}
   * @private
   */
  this.bounceCount_ = bounceCount;
};
goog.inherits(dotprod.entities.Bomb, dotprod.entities.Projectile);

/**
 * @override
 */
dotprod.entities.Bomb.prototype.getType = function() {
  return dotprod.model.Weapon.Type.BOMB;
};

/**
 * @param {!dotprod.Map} map
 * @param {!dotprod.PlayerIndex} playerIndex
 */
dotprod.entities.Bomb.prototype.update = function(map, playerIndex) {
  --this.lifetime_;
  if (!this.isAlive()) {
    return;
  }

  this.position_ = this.position_.add(this.velocity_.getXComponent());
  var collision = map.getCollision(this);
  if (collision && collision.tileValue != 255) {
    var xVel = this.velocity_.getX();
    this.position_ = new dotprod.Vector(xVel >= 0 ? collision.left : collision.right, this.position_.getY());
    this.velocity_ = new dotprod.Vector(-xVel, this.velocity_.getY());
    this.bounce_();
  }

  this.position_ = this.position_.add(this.velocity_.getYComponent());
  collision = map.getCollision(this);
  if (collision && collision.tileValue != 255) {
    var yVel = this.velocity_.getY();
    this.position_ = new dotprod.Vector(this.position_.getX(), yVel >= 0 ? collision.top : collision.bottom);
    this.velocity_ = new dotprod.Vector(this.velocity_.getX(), -yVel);
    this.bounce_();
  }

  var players = playerIndex.getPlayers();
  for (var i = 0; i < players.length; ++i) {
    if (this.checkPlayerCollision_(players[i])) {
      break;
    }
  }

  this.animation_.update();
};

/**
 * @param {!dotprod.Camera} camera
 */
dotprod.entities.Bomb.prototype.render = function(camera) {
  if (!this.isAlive()) {
    return;
  }

  var dimensions = camera.getDimensions();
  var x = Math.floor(this.position_.getX() - dimensions.left - this.animation_.getWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.animation_.getHeight() / 2);

  this.animation_.render(camera.getContext(), x, y);
};

/**
 * @param {!dotprod.entities.Player} player
 */
dotprod.entities.Bomb.prototype.checkPlayerCollision_ = function(player) {
  if (!player.isAlive() || this.owner_ == player) {
    return false;
  }

  var dimensions = player.getDimensions();
  var x = this.position_.getX();
  var y = this.position_.getY();
  if (x >= dimensions.left && x <= dimensions.right && y >= dimensions.top && y <= dimensions.bottom) {
    player.takeDamage(this.owner_, this, this.damage_);
    this.lifetime_ = 0;
    this.explode_();
    return true;
  }
  return false;
};

dotprod.entities.Bomb.prototype.bounce_ = function() {
  if (this.bounceCount_ == 0) {
    this.velocity_ = new dotprod.Vector(0, 0);
    this.lifetime_ = 0;
    this.explode_();
  } else if (this.bounceCount_ > 0) {
    --this.bounceCount_;
  }
};

dotprod.entities.Bomb.prototype.explode_ = function() {
  var animation = this.game_.getResourceManager().getVideoEnsemble('explode1').getAnimation(0);
  var explosion = new dotprod.entities.Effect(animation, this.position_, new dotprod.Vector(0, 0));
  this.game_.getEffectIndex().addEffect(explosion);
};