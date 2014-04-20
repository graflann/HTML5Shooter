goog.provide('GameDefaultState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
GameDefaultState = function(game) {
	this.game = game;
};

goog.inherits(GameDefaultState, State);

GameDefaultState.KEY = "default";

/**
*@public
*/
GameDefaultState.prototype.enter = function() {
	this.game.enterGame();
};

/**
*@public
*/
GameDefaultState.prototype.update = function() {
	this.game.updateGame();
};

/**
*@public
*/
GameDefaultState.prototype.exit = function() {
	this.game.exitGame();
};

GameDefaultState.prototype.clear = function() {
	this.game = null;
};

goog.exportSymbol('GameDefaultState', GameDefaultState);