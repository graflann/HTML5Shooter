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
HomingTargetingOverlayInitializationState.prototype.enter = function() {
	this.hto.isActive = true;

	if(this.hto.background.graphics.isEmpty()) {
		this.hto.background.graphics
			.ss(2)
			.s(Constants.LIGHT_BLUE)
			.f(Constants.BLUE)
			.dc(0, 0, this.hto.radius);
	}

	this.hto.background.alpha = 0;
	this.hto.container.scaleX = this.hto.container.scaleY = 0;

	app.layers.getStage(LayerTypes.HOMING).addChild(this.hto.container);
};

/**
*@public
*/
HomingTargetingOverlayInitializationState.prototype.update = function(options) {
	var container = this.hto.container,
		background = this.hto.background;

	background.alpha += 0.00125;

	if(background.alpha > 0.125) {
		background.alpha = 0.125;
	}

	container.scaleX = container.scaleY += 0.025;

	if(container.scaleX > 1) {
		container.scaleX = container.scaleY = 1;

		this.hto.stateMachine.setState(HomingTargetingOverlayOperationState.KEY);
	}
};

/**
*@public
*/
HomingTargetingOverlayInitializationState.prototype.exit = function() {

};

goog.exportSymbol('HomingTargetingOverlayInitializationState', 
	HomingTargetingOverlayInitializationState);