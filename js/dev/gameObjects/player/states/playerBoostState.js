goog.provide('PlayerBoostState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
PlayerBoostState = function(player) {
	this.player = player;

	/**
	* Duration of boost in ms
	*/
	this.boostTime = 750;
};

goog.inherits(PlayerBoostState, State);

PlayerBoostState.KEY = "boost";

/**
*@public
*/
PlayerBoostState.prototype.enter = function(options) {
	var self = this;

	this.player.enterBoost();

	setTimeout(function() {
		self.player.stateMachine.setState(PlayerDefaultState.KEY);
	}, self.boostTime);
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
	this.player.isBoosting = false;
	this.player.damage = 0;
};

goog.exportSymbol('PlayerBoostState', PlayerBoostState);