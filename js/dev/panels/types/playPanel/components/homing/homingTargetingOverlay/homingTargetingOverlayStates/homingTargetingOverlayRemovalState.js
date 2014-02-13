goog.provide('HomingTargetingOverlayRemovalState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
HomingTargetingOverlayRemovalState = function(hto) {
	this.hto = hto;
};

goog.inherits(HomingTargetingOverlayRemovalState, State);

HomingTargetingOverlayRemovalState.KEY = "removal";

/**
*@public
*/
HomingTargetingOverlayRemovalState.prototype.enter = function(options) {
	this.hto.enterRemoval(options);
};

/**
*@public
*/
HomingTargetingOverlayRemovalState.prototype.update = function(options) {
	this.hto.updateRemoval(options);
};

/**
*@public
*/
HomingTargetingOverlayRemovalState.prototype.exit = function(options) {
	this.hto.exitRemoval(options);
};

goog.exportSymbol(
	'HomingTargetingOverlayRemovalState', 
	HomingTargetingOverlayRemovalState
);