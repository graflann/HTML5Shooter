goog.provide('PlayerDefaultState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
PlayerDefaultState = function(player) {
	this.player = player;
};

goog.inherits(PlayerDefaultState, State);

PlayerDefaultState.KEY = "default";

/**
*@public
*/
PlayerDefaultState.prototype.enter = function(options) {
	console.log("Entering state: " + PlayerDefaultState.KEY);
};

/**
*@public
*/
PlayerDefaultState.prototype.update = function(options) {
	this.player.updateDefault(options);
};

/**
*@public
*/
PlayerDefaultState.prototype.exit = function(options) {

};

goog.exportSymbol('PlayerDefaultState', PlayerDefaultState);