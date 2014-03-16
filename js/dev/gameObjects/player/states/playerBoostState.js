goog.provide('PlayerBoostState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
PlayerBoostState = function(player) {
	this.player = player;
};

goog.inherits(PlayerBoostState, State);

PlayerBoostState.KEY = "boost";

/**
* Duration of boost in ms
*/
PlayerBoostState.DURATION = 1000;

/**
*@public
*/
PlayerBoostState.prototype.enter = function(options) {
	console.log("Entering state: " + PlayerBoostState.KEY);
	this.player.enterBoost(options);
};

/**
*@public
*/
PlayerBoostState.prototype.update = function(options) {
	this.player.updateBoost(options);
};

/**
*@public
*/
PlayerBoostState.prototype.exit = function(options) {
	this.player.exitBoost(options);
};

/**
*@public
*/
PlayerBoostState.prototype.clear = function() {
	this.player = null;
};

goog.exportSymbol('PlayerBoostState', PlayerBoostState);