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

Platform.MOVEMENT_RATE = 500;

Platform.MIN_SCALE = 0.75;

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

	this.shape.regX = this.width * 0.5;
	this.shape.regY = this.height * 0.5;
	this.container.addChild(this.shape);

	//this.container.cache(0, 0, this.width, this.height);
};

/**
*@public
*/
Platform.prototype.clear = function() {
	this.container.removeAllChildren();
	this.container = null;

	this.shape.graphics.clear();
	this.shape = null;
};

/**
*@public
*/
Platform.prototype.kill = function() {
	
};

/**
*@public
*/
Platform.prototype.setScale = function(value) {
	this.container.scaleX = this.container.scaleY = value;
};

/**
*@public
*/
Platform.prototype.moveUp = function(callback) {
	if(callback) {
		createjs.Tween.get(this.container).to({ scaleX: 1, scaleY: 1 }, Platform.MOVEMENT_RATE).call(callback);
	} else {
		createjs.Tween.get(this.container).to({ scaleX: 1, scaleY: 1 }, Platform.MOVEMENT_RATE);
	}
	
};

/**
*@public
*/
Platform.prototype.moveDown = function(callback) {
	if(callback) {
		createjs.Tween.get(this.container).to({ 
			scaleX: Platform.MIN_SCALE, 
			scaleY: Platform.MIN_SCALE
		}, Platform.MOVEMENT_RATE).call(callback);
	} else {
		createjs.Tween.get(this.container).to({ 
			scaleX: Platform.MIN_SCALE, 
			scaleY: Platform.MIN_SCALE
		}, Platform.MOVEMENT_RATE);
	}
};

goog.exportSymbol('Platform', Platform);