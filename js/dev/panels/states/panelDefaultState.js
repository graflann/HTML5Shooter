goog.provide('PanelDefaultState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
PanelDefaultState = function(panel) {
	this.panel = panel;
};

goog.inherits(PanelDefaultState, State);

PanelDefaultState.KEY = "default";

/**
*@public
*/
PanelDefaultState.prototype.enter = function(options) {
	console.log("Entering state: Panel " + PanelDefaultState.KEY);
	this.panel.enterDefault(options);
};

/**
*@public
*/
PanelDefaultState.prototype.update = function(options) {
	this.panel.updateDefault(options);
};

/**
*@public
*/
PanelDefaultState.prototype.exit = function(options) {
	this.panel.exitDefault(options);
};

/**
*@public
*/
PanelDefaultState.prototype.clear = function() {
	this.panel = null;
};

goog.exportSymbol('PanelDefaultState', PanelDefaultState);