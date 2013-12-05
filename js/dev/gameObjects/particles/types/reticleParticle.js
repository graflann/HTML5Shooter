goog.provide('ReticleParticle');

goog.require('Particle');

/**
*@constructor
*/
ReticleParticle = function(color) {
	Particle.call(this, color);
	
	this.init();
};

goog.inherits(ReticleParticle, Particle)

/**
*@override
*@public
*/
ReticleParticle.prototype.init = function() {
	Particle.prototype.init.call(this);

	this.shape = new createjs.Shape();
	this.shape.graphics
		.ss(2)
		.s(this.color)
		.dc(0, 0, 24)
		.mt(0, 0)
		.dc(0, 0, 12)
		.mt(0, 0)
		.lt(24, 0)
		.mt(0, 0)
		.lt(0, 24);
	this.shape.snapToPixel = true;
	this.shape.cache(-25, -25, 50, 50);
};

/**
*@override
*@public
*/
ReticleParticle.prototype.update = function(options) {
	if (this.isAlive) {
		this.shape.rotation += 4;
	}
};

/**
*@override
*@public
*/
ReticleParticle.prototype.create = function(options) {
	this.shape.x = Math.randomInRange(
		options.posX - options.posOffsetX, 
		options.posX + options.posOffsetX
	);
	
	this.shape.y = Math.randomInRange(
		options.posY - options.posOffsetY, 
		options.posY + options.posOffsetY
	);
	
	this.velocity.x = Math.randomInRange(-options.velX, options.velX);
	this.velocity.y = Math.randomInRange(-options.velY, options.velY);

	if(options.isRotated) {
		this.shape.rotation = Math.randomInRange(0, 360);
	}
	
	this.isAlive = true;
	
	app.layers.getStage(LayerTypes.HOMING).addChild(this.shape);
};

/**
*@override
*@public
*/
ReticleParticle.prototype.kill = function() {
	Particle.prototype.kill.call(this);

};
