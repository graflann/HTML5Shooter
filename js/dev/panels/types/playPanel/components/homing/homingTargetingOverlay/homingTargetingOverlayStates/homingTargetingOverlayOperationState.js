goog.provide('HomingTargetingOverlayOperationState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
HomingTargetingOverlayOperationState = function(hto) {
	this.hto = hto;
};

goog.inherits(HomingTargetingOverlayOperationState, State);

HomingTargetingOverlayOperationState.KEY = "operation";

HomingTargetingOverlayOperationState.SCALAR = 0.05;

/**
*@public
*/
HomingTargetingOverlayOperationState.prototype.enter = function(options) {
	this.hto.enterOperation(options);
};

/**
*@public
*/
HomingTargetingOverlayOperationState.prototype.update = function(options) {
	this.hto.updateOperation(options);
};

/**
*@public
*/
HomingTargetingOverlayOperationState.prototype.exit = function(options) {
	this.hto.exitOperation(options);
};

goog.exportSymbol('HomingTargetingOverlayOperationState', 
	HomingTargetingOverlayOperationState);