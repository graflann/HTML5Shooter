goog.provide('PlayerOverdriveState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
PlayerOverdriveState = function(player) {
	this.player = player;
};

goog.inherits(PlayerOverdriveState, State);

PlayerOverdriveState.KEY = "overdrive";

/**
* Duration of overdrive in frames (20 seconds)
*/
PlayerOverdriveState.DURATION = 1200;

/**
*@public
*/
PlayerOverdriveState.prototype.enter = function(options) {
	console.log("Entering state: " + PlayerOverdriveState.KEY);
	this.player.enterOverdrive(options);
};

/**
*@public
*/
PlayerOverdriveState.prototype.update = function(options) {
	this.player.updateOverdrive(options);
};

/**
*@public
*/
PlayerOverdriveState.prototype.exit = function(options) {
	this.player.exitOverdrive(options);
};

/**
*@public
*/
PlayerOverdriveState.prototype.clear = function() {
	this.player = null;
};

goog.exportSymbol('PlayerOverdriveState', PlayerOverdriveState);