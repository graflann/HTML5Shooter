goog.provide('HatchDoor');

goog.require('GameObject');

/**
*@constructor
*A sliding door object that opens and closes
*/
HatchDoor = function(width, height, arrColors, alpha) {
	GameObject.call(this);

	this.width = width;

	this.height = height;

	this.arrColors = arrColors;

	this.alpha = alpha;

	this.shape = null;

	this.init();
};

goog.inherits(HatchDoor, GameObject);

HatchDoor.SLIDE_RATE = 500;

/**
*@public
*/
HatchDoor.prototype.init = function() {
	this.shape = new createjs.Shape();
	this.shape.graphics
		.ss(1)
		.s(this.arrColors[0])
		.lf(this.arrColors, [0, 1], 0, 0, this.width, 0)
		.dr(0, 0, this.width, this.height);

	this.shape.alpha = this.alpha;

	this.shape.cache(0, 0, this.width, this.height);
};

/**
*@public
*/
HatchDoor.prototype.clear = function() {
	this.shape = null;
};

/**
*@public
*/
HatchDoor.prototype.kill = function() {
	
};

/**
*@public
*/
HatchDoor.prototype.open = function() {
	if(this.shape.scaleX !== 0) {
		createjs.Tween.get(this.shape).to({ scaleX: 0 }, HatchDoor.SLIDE_RATE);
	}
};

/**
*@public
*/
HatchDoor.prototype.close = function() {
	if(this.shape.scaleX !== 1) {
		createjs.Tween.get(this.shape).to({ scaleX: 1 }, HatchDoor.SLIDE_RATE);
	}
};

goog.exportSymbol('HatchDoor', HatchDoor);