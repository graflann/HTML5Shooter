goog.provide('ParticleSystem');

goog.require('Particle');
goog.require('ParticleClasses');

/**
*@constructor
*Ammo for Turret instaces
*/
ParticleSystem = function(type, color, max) {
	this.type = type;

	this.color = color;

	this.max = max || 8;

	this.arrParticles = new Array(this.max);

	this.init();
};

goog.inherits(ParticleSystem, goog.events.EventTarget);

ParticleSystem.prototype.init = function() {
	var ParticleClass = ParticleClasses[this.type],
		i = -1;

	while(++i < this.max){
		this.arrParticles[i] = new ParticleClass(this.color);
	}

	//TODO: Resolve width and height?
};

ParticleSystem.prototype.update = function(options) {
	var i = -1;

	while(++i < this.max) {
		this.arrParticles[i].update(options);
	}
};

ParticleSystem.prototype.clear = function() {
	var i = -1;

	while(++i < this.max) {
		this.arrParticles[i].clear();
		this.arrParticles[i] = null;
	}
	
	this.arrParticles = null;
};

ParticleSystem.prototype.kill = function() {
	var i = -1;

	while(++i < this.max) {
		this.arrParticles[i].kill();
	}
};

ParticleSystem.prototype.emit = function(quantity, options) {
	var i = -1,
		particle,
		options = options || {};
		
	options.posX 		= options.posX || 0,
	options.posY 		= options.posY || 0,
	options.posOffsetX 	= options.posOffsetX || 0,
	options.posOffsetY 	= options.posOffsetY || 0,
	options.velX 		= options.velX || 0,
	options.velY 		= options.velY || 0,
	options.minScale 	= options.minScale || 1,
	options.maxScale 	= options.maxScale || 1,
	options.isRotated 	= options.isRotated || false;

	while (++i < quantity) {
		particle = this.getParticle();
		
		if (particle) {
			particle.create(options);
		}
	}
};

ParticleSystem.prototype.getParticle = function() {
	var i = -1,
		particle;
			
	while (++i < this.max) {
		particle = this.arrParticles[i];

		if (!particle.isAlive) {
			return particle;
		}
	}
	
	return null;
};

ParticleSystem.prototype.getLastAlive = function() {
	var i = this.max,
		particle;
			
	while (--i > -1) {
		particle = this.arrParticles[i];

		if (particle.isAlive) {
			return particle;
		}
	}
	
	return null;
};

ParticleSystem.prototype.length = function() {
	return this.arrParticles.length;
};
