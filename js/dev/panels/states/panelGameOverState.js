goog.provide('PanelGameOverState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
PanelGameOverState = function(panel) {
	this.panel = panel;
};

goog.inherits(PanelGameOverState, State);

PanelGameOverState.KEY = "gameOver";

/**
*@public
*/
PanelGameOverState.prototype.enter = function(options) {
	console.log("Entering state: Panel " + PanelGameOverState.KEY);
	this.panel.enterGameOver(options);
};

/**
*@public
*/
PanelGameOverState.prototype.update = function(options) {
	this.panel.updateGameOver(options);
};

/**
*@public
*/
PanelGameOverState.prototype.exit = function(options) {
	this.panel.exitGameOver(options);
};

/**
*@public
*/
PanelGameOverState.prototype.clear = function() {
	this.panel = null;
};

goog.exportSymbol('PanelGameOverState', PanelGameOverState);