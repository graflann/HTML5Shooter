goog.provide('LoadingPanel');

goog.require('Panel');
goog.require('InputOptions');
goog.require('ReticleParticle');

/**
*@constructor
*Game options manipulated here
*/
LoadingPanel = function() {
	Panel.call(this);

	this.background = null;

	this.container = null;

	this.loadingText = null;

	this.reticle = null;

	this.clearCompleteEvent = new goog.events.Event(EventNames.CLEAR_COMPLETE, this);

	this.init();
};

goog.inherits(LoadingPanel, Panel);

LoadingPanel.Z_INDEX = 1000;

/**
*@override
*@public
*/
LoadingPanel.prototype.init = function() {
	var	layer = app.layers.add(LayerTypes.LOADING);
		stage = app.layers.getStage(LayerTypes.LOADING),
		loadingLabel = "loading";

	//ensures the loading panels always rendering on top
	layer.setZindex(LoadingPanel.Z_INDEX);

	this.background = new createjs.Shape();
	this.background.graphics
		.lf([Constants.DARK_BLUE, Constants.BLACK], [0, 0.75], 0, 0, 0, Constants.HEIGHT)
		.dr(0, 0, Constants.WIDTH, Constants.HEIGHT);

	this.container = new createjs.Container();

	this.loadingText = new createjs.Text(
		loadingLabel, 
		"16px AXI_Fixed_Caps_5x5", 
		Constants.LIGHT_BLUE
	);
	this.loadingText.x = Constants.WIDTH - 148;
	this.loadingText.y = Constants.HEIGHT - 38;

	this.reticle = new ReticleParticle(Constants.LIGHT_BLUE);
	this.reticle.shape.x = Constants.WIDTH - Constants.UNIT;
	this.reticle.shape.y = this.loadingText.y + 6;
	this.reticle.isAlive = true;

	this.container.addChild(this.loadingText);
    this.container.addChild(this.reticle.shape);
    
	stage.addChild(this.background);
	stage.addChild(this.container);

	this.container.alpha = 0;

	//fades in the loading text and reticle
    createjs.Tween.get(this.container).to({ alpha: 1 }, 1000);
};

/**
*@override
*@public
*/
LoadingPanel.prototype.update = function() {
	Panel.prototype.update.call(this);

	this.reticle.update();
};

/**
*@override
*@public
*/
LoadingPanel.prototype.clear = function() {
	var self = this;

	this.background.graphics.clear();
	this.background = null;

	this.container.removeAllChildren();
	this.container = null;

	this.loadingText = null;
	this.reticle = null;

	app.layers.remove(LayerTypes.LOADING);
};

/**
*@public
*/
LoadingPanel.prototype.startClear = function() {
	var self = this;

	createjs.Tween.removeTweens(this.container);

	this.container.alpha = 1;

	createjs.Tween.get(self.container)
		.to({ alpha: 0 }, 1000)
		.call(function() { goog.events.dispatchEvent(self, self.clearCompleteEvent); });
};