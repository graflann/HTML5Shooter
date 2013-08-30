goog.provide('Rotor');

/**
*@constructor
*/
Rotor = function(color, radius) {
	this.color = color;

	this.radius = radius;

	this.shape = null;
	
	this.init();
};

/**
*@private
*/
Rotor.prototype.init = function() {
	var diameter = this.radius * 2;

	this.shape = new createjs.Shape();
	this.shape.graphics
		.ss(2)
		.s(this.color)
		.dc(0, 0, this.radius)
		.mt(0, 0)
		.lt(this.radius, 0)
		.mt(0, 0)
		.lt(-this.radius, 0)
		.mt(0, 0)
		.lt(0, this.radius)
		.mt(0, 0)
		.lt(0, -this.radius);
	this.shape.snapToPixel = true;
	this.shape.cache(-this.radius, -this.radius, diameter, diameter);
};

/**
*@public
*/
Rotor.prototype.update = function(options) {
	this.shape.rotation += 30;
};

/**
*@public
*/
Rotor.prototype.clear = function() {
	this.shape.graphics.clear();
	this.shape = null;
};
