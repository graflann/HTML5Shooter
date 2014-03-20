goog.provide('PanelIntroState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
PanelIntroState = function(panel) {
	this.panel = panel;
};

goog.inherits(PanelIntroState, State);

PanelIntroState.KEY = "intro";

/**
*@public
*/
PanelIntroState.prototype.enter = function(options) {
	console.log("Entering state: Panel " + PanelIntroState.KEY);
	this.panel.enterIntro(options);
};

/**
*@public
*/
PanelIntroState.prototype.update = function(options) {
	this.panel.updateIntro(options);
};

/**
*@public
*/
PanelIntroState.prototype.exit = function(options) {
	this.panel.exitIntro(options);
};

/**
*@public
*/
PanelIntroState.prototype.clear = function() {
	this.panel = null;
};

goog.exportSymbol('PanelIntroState', PanelIntroState);