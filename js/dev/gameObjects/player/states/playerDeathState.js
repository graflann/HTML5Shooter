goog.provide('PlayerDeathState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
PlayerDeathState = function(player) {
	this.player = player;
};

goog.inherits(PlayerDeathState, State);

PlayerDeathState.KEY = "death";

/**
*@public
*/
PlayerDeathState.prototype.enter = function(options) {
	console.log("Entering state: " + PlayerDeathState.KEY);
	this.player.enterDeath(options);
};

/**
*@public
*/
PlayerDeathState.prototype.update = function(options) {
	this.player.updateDeath(options);
};

/**
*@public
*/
PlayerDeathState.prototype.exit = function(options) {
	this.player.exitDeath(options);
};

/**
*@public
*/
PlayerDeathState.prototype.clear = function() {
	this.player = null;
};

goog.exportSymbol('PlayerDeathState', PlayerDeathState);