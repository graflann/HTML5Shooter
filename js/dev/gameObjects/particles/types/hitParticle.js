goog.provide('HitParticle');

goog.require('Particle');

/**
*@constructor
*/
HitParticle = function(color) {
	Particle.call(this, color);
	
	this.init();
};

goog.inherits(HitParticle, Particle)

/**
*@override
*@public
*/
HitParticle.prototype.init = function() {
	var value = 4;

	this.shape = new createjs.Shape();
	this.shape.graphics
		.ss(1)
		.s(this.color)
		.mt(-value, -value)
		.qt(-value * 0.1, 0, -value, value)
		.qt(0, value * 0.1, value, value)
		.qt(value * 0.1, 0, value, -value)
		.qt(0, -value * 0.1, -value, -value)
};

/**
*@override
*@public
*/
HitParticle.prototype.update = function(options) {
	if (this.isAlive) {
		this.shape.rotation += Math.randomInRange(5, 15);

		this.shape.alpha -= 0.075;

		if(this.shape.alpha < 0) {
			this.kill();
		}
	}
};

/**
*@override
*@public
*/
HitParticle.prototype.create = function(options) {
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
HitParticle.prototype.kill = function() {
	Particle.prototype.kill.call(this);

	this.shape.alpha = 1;
};
