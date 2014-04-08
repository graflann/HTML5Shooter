goog.provide('ParticleOperationState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
ParticleOperationState = function(particle) {
	this.particle = particle;
};

goog.inherits(ParticleOperationState, State);

ParticleOperationState.KEY = "operation";

ParticleOperationState.SCALAR = 0.05;

/**
*@public
*/
ParticleOperationState.prototype.enter = function(options) {
	this.particle.enterOperation(options);
};

/**
*@public
*/
ParticleOperationState.prototype.update = function(options) {
	this.particle.updateOperation(options);
};

/**
*@public
*/
ParticleOperationState.prototype.exit = function(options) {
	this.particle.exitOperation(options);
};

ParticleOperationState.prototype.clear = function(options) {
	this.particle = null;
};

goog.exportSymbol('ParticleOperationState', ParticleOperationState);