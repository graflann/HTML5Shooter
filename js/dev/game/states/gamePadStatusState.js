goog.provide('GamePadStatusState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
GamePadStatusState = function(game) {
	this.game = game;
};

goog.inherits(GamePadStatusState, State);

GamePadStatusState.KEY = "gamepadStatus";

/**
*@public
*/
GamePadStatusState.prototype.enter = function() {
	this.game.enterGamepadStatus();
};

/**
*@public
*/
GamePadStatusState.prototype.update = function() {
	this.game.updateGamepadStatus();
};

/**
*@public
*/
GamePadStatusState.prototype.exit = function() {
	this.game.exitGamepadStatus();
};

GamePadStatusState.prototype.clear = function() {
	this.game = null;
};

goog.exportSymbol('GamePadStatusState', GamePadStatusState);