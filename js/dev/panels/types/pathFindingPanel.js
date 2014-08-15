goog.provide('PathFindingPanel');

goog.require('Panel');
goog.require('PathFinder');

/**
*@constructor
*PathFindingPanel screen; a path finder testing / visualization panel
*/
PathFindingPanel = function() {
	Panel.call(this);
	
	this.background = null;

	this.pathFinder = null;

	this.init();
};

goog.inherits(PathFindingPanel, Panel);

/**
*@override
*@protected
*/
PathFindingPanel.prototype.init = function() {	
    var stage = app.layers.getStage(LayerTypes.MAIN);

    this.background = new createjs.Shape();
    this.background.graphics
    	.lf([Constants.DARK_BLUE, Constants.BLACK], [0, 1], 0, 0, 0, Constants.HEIGHT)
    	.dr(0, 0, Constants.WIDTH, Constants.HEIGHT);

	stage.addChild(this.background);

	this.pathFinder = new PathFinder(Constants.WIDTH, Constants.HEIGHT);
};

/**
*@override
*@protected
*/
PathFindingPanel.prototype.update = function() {
	Panel.prototype.update.call(this);
};

/**
*@override
*@protected
*/
PathFindingPanel.prototype.clear = function() {
	Panel.prototype.clear.call(this);

	this.background.graphics.clear();

	this.background = null;
};

