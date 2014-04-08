goog.provide('ParticleInitializationState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
ParticleInitializationState = function(particle) {
	this.particle = particle;
};

goog.inherits(ParticleInitializationState, State);

ParticleInitializationState.KEY = "initialization";

/**
*@public
*/
ParticleInitializationState.prototype.enter = function(options) {
	this.particle.enterInitialization(options);
};

/**
*@public
*/
ParticleInitializationState.prototype.update = function(options) {
	this.particle.updateInitialization(options);
};

/**
*@public
*/
ParticleInitializationState.prototype.exit = function(options) {
	this.particle.exitInitialization(options);
};

ParticleInitializationState.prototype.clear = function(options) {
	this.particle = null;
};

goog.exportSymbol('ParticleInitializationState', ParticleInitializationState);