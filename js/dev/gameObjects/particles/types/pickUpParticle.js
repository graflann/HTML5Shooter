goog.provide('PickUpParticle');

goog.require('Particle');

/**
*@constructor
*/
PickUpParticle = function(color) {
	Particle.call(this, color);
	
	this.init();
};

goog.inherits(PickUpParticle, Particle)

/**
*@override
*@public
*/
PickUpParticle.prototype.init = function() {
	this.shape = new createjs.Shape();
	this.shape.graphics
		.f(this.color)
		.dc(0, 0, 4);

	Particle.prototype.init.call(this);
};

/**
*@override
*@public
*/
PickUpParticle.prototype.update = function(options) {
	if (this.isAlive) {
		this.position.x = this.shape.x = options.target.position.x;
		this.position.y = this.shape.y = options.target.position.y;

		this.shape.scaleX = this.shape.scaleY += 0.5;
		this.shape.alpha -= 0.05;

		if(this.shape.alpha < 0) {
			this.kill();
		}
	}
};

/**
*@override
*@public
*/
PickUpParticle.prototype.kill = function() {
	Particle.prototype.kill.call(this);

	this.shape.scaleX = this.shape.scaleY = Math.randomInRange(0.25, 3);

	this.shape.alpha = 1;

	this.isAlive = false;
};