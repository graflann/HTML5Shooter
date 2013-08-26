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
