/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.FontFoundry');
goog.provide('dotprod.Font');

/**
 * @constructor
 * @param {string} name
 * @param {number} height
 * @param {number} lineHeight
 */
dotprod.Font = function(name, height, lineHeight) {
  /**
   * @type {string}
   * @private
   */
  this.name_ = name;

  /**
   * @type {number}
   * @private
   */
  this.height_ = height;

  /**
   * @type {number}
   * @private
   */
  this.lineHeight_ = lineHeight;
};

/**
 * @return {number}
 */
dotprod.Font.prototype.getHeight = function() {
  return this.height_;
};

/**
 * @return {number}
 */
dotprod.Font.prototype.getLineHeight = function() {
  return this.lineHeight_;
};

dotprod.Font.prototype.toString = function() {
  return '' + this.height_ + 'px/' + this.lineHeight_ + 'px ' + this.name_;
};

/**
 * @const
 * @type {!dotprod.Font}
 * @private
 */
dotprod.FontFoundry.DEFAULT_TINY_FONT_ = new dotprod.Font('Subspace Tiny', 8, 10);

/**
 * @const
 * @type {!dotprod.Font}
 * @private
 */
dotprod.FontFoundry.DEFAULT_SMALL_FONT_ = new dotprod.Font('Subspace Small', 8, 10);

/**
 * @const
 * @type {!dotprod.Font}
 * @private
 */
dotprod.FontFoundry.DEFAULT_REGULAR_FONT_ = new dotprod.Font('Subspace Regular', 12, 15);

/**
 * @const
 * @type {!dotprod.Font}
 * @private
 */
dotprod.FontFoundry.DEFAULT_LARGE_FONT_ = new dotprod.Font('Subspace Large', 18, 20);

/**
 * @const
 * @type {!dotprod.Font}
 * @private
 */
dotprod.FontFoundry.DEFAULT_HUGE_FONT_ = new dotprod.Font('Subspace Huge', 24, 30);

/**
 * @return {!dotprod.Font}
 */
dotprod.FontFoundry.playerFont = function() {
  return dotprod.FontFoundry.DEFAULT_REGULAR_FONT_;
};

/**
 * @return {!dotprod.Font}
 */
dotprod.FontFoundry.scoreboardFont = function() {
  return dotprod.FontFoundry.DEFAULT_REGULAR_FONT_;
};

/**
 * @return {!dotprod.Font}
 */
dotprod.FontFoundry.chatFont = function() {
  return dotprod.FontFoundry.DEFAULT_REGULAR_FONT_;
};

/**
 * @return {!dotprod.Font}
 */
dotprod.FontFoundry.notificationsFont = function() {
  return dotprod.FontFoundry.DEFAULT_REGULAR_FONT_;
};
