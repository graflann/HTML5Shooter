goog.provide('HitParticle');

goog.require('Particle');
goog.require('BoundsUtils');


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
	var value = 4,
		cacheValue = value + 1;

	Particle.prototype.init.call(this);

	this.shape = new createjs.Shape();
	this.shape.graphics
		.ss(2)
		.s(this.color)
		.f(Constants.BLACK)
		.mt(-value, -value)
		.qt(-value * 0.1, 0, -value, value)
		.qt(0, value * 0.1, value, value)
		.qt(value * 0.1, 0, value, -value)
		.qt(0, -value * 0.1, -value, -value);
	this.shape.snapToPixel = true;
	this.shape.cache(-cacheValue, -cacheValue, cacheValue * 2, cacheValue * 2);
};

/**
*@override
*@public
*/
HitParticle.prototype.update = function(options) {
	if (this.isAlive) {
		this.position.x = this.shape.x;
		this.position.y = this.shape.y;

		this.shape.rotation += Math.randomInRange(5, 15);

		this.shape.alpha -= 0.075;

		this.shape.scaleX = this.shape.scaleY += 0.075;

		if(this.shape.alpha < 0) {
			this.kill();
		}

		BoundsUtils.checkBounds(this.position, this.shape, options.camera);
	}
};

/**
*@override
*@public
*/
HitParticle.prototype.clear = function() {
	this.shape.uncache();

	Particle.prototype.clear.call(this);
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
	this.shape.scaleX = this.shape.scaleY = 1;
};
