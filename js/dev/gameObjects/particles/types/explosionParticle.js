goog.provide('ExplosionParticle');

goog.require('Particle');
goog.require('BoundsUtils');

/**
*@constructor
*/
ExplosionParticle = function(color) {
	Particle.call(this, color);
	
	this.init();
};

goog.inherits(ExplosionParticle, Particle)

/**
*@override
*@public
*/
ExplosionParticle.prototype.init = function() {
	Particle.prototype.init.call(this);

	this.shape = new createjs.Shape();
	this.shape.graphics.ss(1).s(this.color).f("#000").dc(0, 0, 3);

	this.shape.scaleX = this.shape.scaleY = Math.randomInRange(0.25, 3);
	this.shape.cache(-4, -4, 8, 8);
};

/**
*@override
*@public
*/
ExplosionParticle.prototype.update = function(options) {
	if (this.isAlive){
		this.position.x = this.shape.x += this.velocity.x;
		this.position.y = this.shape.y += this.velocity.y;

		this.shape.scaleX = this.shape.scaleY += 0.5;
		this.shape.alpha -= 0.05;

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
ExplosionParticle.prototype.clear = function() {
	this.shape.uncache();

	Particle.prototype.clear.call(this);
};

/**
*@override
*@public
*/
ExplosionParticle.prototype.kill = function() {
	Particle.prototype.kill.call(this);

	this.shape.scaleX = this.shape.scaleY = Math.randomInRange(0.25, 3);

	this.shape.alpha = 1;
};
