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

};

/**
*@public
*/
HomingTargetingOverlayRemovalState.prototype.update = function(options) {
	var container = this.hto.container,
		background = this.hto.background;

	background.alpha -= 0.0025;

	if(background.alpha < 0) {
		background.alpha = 0;
	}

	container.scaleX = container.scaleY -= 0.05;

	if(container.scaleX < 0) {
		container.scaleX = container.scaleY = 0;

		this.hto.stateMachine.setState(State.KEY);
	}
};

/**
*@public
*/
HomingTargetingOverlayRemovalState.prototype.exit = function(options) {
	this.hto.background.graphics.clear();

	//this.container.alpha = 0;
	//this.container.scaleX = this.container.scaleY = 0;

	app.layers.getStage(LayerTypes.HOMING).removeChild(this.hto.container);

	this.hto.isActive = false;
};

goog.exportSymbol('HomingTargetingOverlayRemovalState', 
	HomingTargetingOverlayRemovalState);