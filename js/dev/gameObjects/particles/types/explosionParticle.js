goog.provide('ExplosionParticle');

goog.require('Particle');

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
	this.shape.graphics.ss(0.5).s(this.color).f("#000").dc(0, 0, 3);

	this.shape.scaleX = this.shape.scaleY = Math.randomInRange(0.25, 3);
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
	}
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
