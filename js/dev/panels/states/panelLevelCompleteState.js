goog.provide('PanelLevelCompleteState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
PanelLevelCompleteState = function(panel) {
	this.panel = panel;
};

goog.inherits(PanelLevelCompleteState, State);

PanelLevelCompleteState.KEY = "levelComplete";

/**
*@public
*/
PanelLevelCompleteState.prototype.enter = function(options) {
	console.log("Entering state: Panel " + PanelLevelCompleteState.KEY);
	this.panel.enterLevelComplete(options);
};

/**
*@public
*/
PanelLevelCompleteState.prototype.update = function(options) {
	this.panel.updateLevelComplete(options);
};

/**
*@public
*/
PanelLevelCompleteState.prototype.exit = function(options) {
	this.panel.exitLevelComplete(options);
};

/**
*@public
*/
PanelLevelCompleteState.prototype.clear = function() {
	this.panel = null;
};

goog.exportSymbol('PanelLevelCompleteState', PanelLevelCompleteState);