goog.provide('HomingTargetingOverlayInitializationState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
HomingTargetingOverlayInitializationState = function(hto) {
	this.hto = hto;
};

goog.inherits(HomingTargetingOverlayInitializationState, State);

HomingTargetingOverlayInitializationState.KEY = "initialization";

/**
*@public
*/
HomingTargetingOverlayInitializationState.prototype.enter = function(options) {
	this.hto.enterInitialization(options);
};

/**
*@public
*/
HomingTargetingOverlayInitializationState.prototype.update = function(options) {
	this.hto.updateInitialization(options);
};

/**
*@public
*/
HomingTargetingOverlayInitializationState.prototype.exit = function(options) {
	this.hto.exitInitialization(options);
};

HomingTargetingOverlayInitializationState.prototype.clear = function(options) {
	this.hto = null;
};

goog.exportSymbol('HomingTargetingOverlayInitializationState', 
	HomingTargetingOverlayInitializationState);