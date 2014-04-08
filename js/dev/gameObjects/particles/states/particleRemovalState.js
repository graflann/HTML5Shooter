goog.provide('ParticleRemovalState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
ParticleRemovalState = function(particle) {
	this.particle = particle;
};

goog.inherits(ParticleRemovalState, State);

ParticleRemovalState.KEY = "removal";

/**
*@public
*/
ParticleRemovalState.prototype.enter = function(options) {
	this.particle.enterRemoval(options);
};

/**
*@public
*/
ParticleRemovalState.prototype.update = function(options) {
	this.particle.updateRemoval(options);
};

/**
*@public
*/
ParticleRemovalState.prototype.exit = function(options) {
	this.particle.exitRemoval(options);
};

ParticleRemovalState.prototype.clear = function(options) {
	this.particle = null;
};

goog.exportSymbol('ParticleRemovalState', ParticleRemovalState);