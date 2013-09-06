goog.provide('EnemyCentipedeSeekingState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
EnemyCentipedeSeekingState = function(enemy) {
	this.enemy = enemy;
};

goog.inherits(EnemyCentipedeSeekingState, State);

EnemyCentipedeSeekingState.KEY = "seeking";

/**
*@public
*/
EnemyCentipedeSeekingState.prototype.enter = function(options) {
	// var self = this;

	// setTimeout(function() {
	// 	self.enemy.stateMachine.setState(EnemyCopterSeekingState.KEY);
	// }, 2000);
};

/**
*@public
*/
EnemyCentipedeSeekingState.prototype.update = function(options) {
	this.enemy.updateSeeking(options);
};

/**
*@public
*/
EnemyCentipedeSeekingState.prototype.exit = function(options) {

};

goog.exportSymbol('EnemyCentipedeSeekingState', EnemyCentipedeSeekingState);