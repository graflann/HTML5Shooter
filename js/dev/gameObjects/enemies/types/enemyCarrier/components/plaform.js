goog.provide('Platform');

goog.require('GameObject');

/**
*@constructor
*A sliding door object that opens and closes
*/
Platform = function(width, height, color) {
	GameObject.call(this);

	this.width = width;

	this.height = height;

	this.color = color;

	this.container = null;

	this.shape = null;

	this.init();
};

goog.inherits(Platform, GameObject);

Platform.SLIDE_RATE = 500;

/**
*@public
*/
Platform.prototype.init = function() {
	this.container = new createjs.Container();

	this.shape = new createjs.Shape();
	this.shape.graphics
		.ss(1)
		.s(this.color)
		.f(this.color)
		.dr(0, 0, this.width, this.height);

	this.container.addChild(this.shape);

	this.container.cache(0, 0, this.width, this.height);
};

/**
*@public
*/
Platform.prototype.clear = function() {
	this.shape = null;
};

/**
*@public
*/
Platform.prototype.kill = function() {
	
};

goog.exportSymbol('Platform', Platform);