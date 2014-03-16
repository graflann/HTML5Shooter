goog.provide('PlayerRechargeState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
PlayerRechargeState = function(player) {
	this.player = player;
};

goog.inherits(PlayerRechargeState, State);

PlayerRechargeState.KEY = "recharge";

/**
*@public
*/
PlayerRechargeState.prototype.enter = function(options) {
	console.log("Entering state: " + PlayerRechargeState.KEY);

	this.player.enterRecharge(options);
};

/**
*@public
*/
PlayerRechargeState.prototype.update = function(options) {
	this.player.updateRecharge(options);
};

/**
*@public
*/
PlayerRechargeState.prototype.exit = function(options) {
	this.player.exitRecharge(options);
};

/**
*@public
*/
PlayerRechargeState.prototype.clear = function() {
	this.player = null;
};

goog.exportSymbol('PlayerRechargeState', PlayerRechargeState);