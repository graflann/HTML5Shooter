goog.provide('EnemyCentipedeRetreatingState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
EnemyCentipedeRetreatingState = function(enemy) {
	this.enemy = enemy;
};

goog.inherits(EnemyCentipedeRetreatingState, State);

EnemyCentipedeRetreatingState.KEY = "retreating";

/**
*@public
*/
EnemyCentipedeRetreatingState.prototype.enter = function(options) {
	// var self = this;

	// setTimeout(function() {
	// 	self.enemy.stateMachine.setState(EnemyCopterSeekingState.KEY);
	// }, 2000);
};

/**
*@public
*/
EnemyCentipedeRetreatingState.prototype.update = function(options) {
	this.enemy.updateRetreating(options);
};

/**
*@public
*/
EnemyCentipedeRetreatingState.prototype.exit = function(options) {

};

goog.exportSymbol('EnemyCentipedeRetreatingState', EnemyCentipedeRetreatingState);