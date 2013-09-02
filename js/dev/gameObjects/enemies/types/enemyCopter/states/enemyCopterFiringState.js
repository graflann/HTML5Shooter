goog.provide('EnemyCopterFiringState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
EnemyCopterFiringState = function(enemy) {
	this.enemy = enemy;
};

goog.inherits(EnemyCopterFiringState, State);

EnemyCopterFiringState.KEY = "firing";

/**
*@public
*/
EnemyCopterFiringState.prototype.enter = function(options) {
	var self = this;

	setTimeout(function() {
		self.enemy.stateMachine.setState(EnemyCopterSeekingState.KEY);
	}, 2000);
};

/**
*@public
*/
EnemyCopterFiringState.prototype.update = function(options) {
	this.enemy.updateFiring(options);
};

/**
*@public
*/
EnemyCopterFiringState.prototype.exit = function(options) {

};

goog.exportSymbol('EnemyCopterFiringState', EnemyCopterFiringState);