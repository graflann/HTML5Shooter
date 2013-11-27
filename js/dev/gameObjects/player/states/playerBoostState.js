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
*@public
*/
PlayerBoostState.prototype.enter = function(options) {
	var self = this;

	setTimeout(function() {
		self.player.stateMachine.setState(PlayerDefaultState.KEY);
	}, 1000);
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

};

goog.exportSymbol('PlayerBoostState', PlayerBoostState);