goog.provide('EnemyCopterSeekingState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
EnemyCopterSeekingState = function(enemy) {
	this.enemy = enemy;
};

goog.inherits(EnemyCopterSeekingState, State);

EnemyCopterSeekingState.KEY = "seeking";

/**
*@public
*/
EnemyCopterSeekingState.prototype.enter = function(options) {
	// var firingDistance = 200;

	// this.target.position

	// this.enemy.firingPosition.x = 
};

/**
*@public
*/
EnemyCopterSeekingState.prototype.update = function(options) {
	this.enemy.updateSeeking(options);
};

/**
*@public
*/
EnemyCopterSeekingState.prototype.exit = function(options) {

};

goog.exportSymbol('EnemyCopterSeekingState', EnemyCopterSeekingState);