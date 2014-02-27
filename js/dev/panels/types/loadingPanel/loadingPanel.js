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

	this.loadingText = null;

	this.reticle = null;

	this.init();
};

goog.inherits(LoadingPanel, Panel);

LoadingPanel.Z_INDEX = 1000;

/**
*@override
*@protected
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

	stage.addChild(this.background);
    stage.addChild(this.loadingText);
    stage.addChild(this.reticle.shape);
};

/**
*@override
*@protected
*/
LoadingPanel.prototype.update = function() {
	Panel.prototype.update.call(this);

	this.reticle.update();
};

/**
*@override
*@protected
*/
LoadingPanel.prototype.clear = function() {
	Panel.prototype.clear.call(this);

	this.background.graphics.clear();
	this.background = null;

	this.loadingText = null;

	this.reticle.clear();
	this.reticle = null;
};