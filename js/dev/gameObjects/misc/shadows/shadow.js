goog.provide('Shadow');

goog.require('GameObject');

/**
*@constructor
*A shadow effect rendering below an airborne enemy to accentuate a sense of depth
*/
Shadow = function(parentObject, offset, scale) {
	GameObject.call(this);

	this.parentObject = parentObject;

	this.offset = offset || new app.b2Vec2(48, 48);

	this.scale = scale || 0.6;

	this.container = null;

	this.shape = null;
};

goog.inherits(Shadow, GameObject);

Shadow.COLOR_FILTERS = [ new createjs.ColorFilter(0, 0, 0.25, 0.75) ];

Shadow.FLICKER_RATE = 3;

/**
*@public
*/
Shadow.prototype.init = function() {
	this.container = new createjs.Container();

	this.shape = this.parentObject.shape.clone();
	this.shape.filters = Shadow.COLOR_FILTERS;
	this.shape.cache(0, 0, this.parentObject.width, this.parentObject.height);
	this.shape.regX = this.parentObject.shape.regX;
	this.shape.regY = this.parentObject.shape.regY;

	this.container.addChild(this.shape);
};

/**
*@public
*/
Shadow.prototype.update = function(options) {
	this.updateFlicker();
};

/**
*@public
*/
Shadow.prototype.clear = function() {
	GameObject.prototype.clear.call(this);

	this.container.removeAllChildren();
	this.container = null;

	this.shape.uncache();
	this.shape = null;
};

/**
*@public
*/
Shadow.prototype.kill = function() {
	
};

/**
*creates an intermittent, flickering effect
*@private
*/
Shadow.prototype.updateFlicker = function() {
	if(createjs.Ticker.getTicks() % Shadow.FLICKER_RATE == 0) {
		this.container.alpha = 0;
	} else {
		this.container.alpha = 1;
	}
};

goog.exportSymbol('Shadow', Shadow);