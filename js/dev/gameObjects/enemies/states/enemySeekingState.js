goog.provide('EnemySeekingState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
EnemySeekingState = function(enemy) {
	this.enemy = enemy;
};

goog.inherits(EnemySeekingState, State);

EnemySeekingState.KEY = "seeking";

/**
*@public
*/
EnemySeekingState.prototype.enter = function(options) {
	this.enemy.enterSeeking(options);
};

/**
*@public
*/
EnemySeekingState.prototype.update = function(options) {
	this.enemy.updateSeeking(options);
};

/**
*@public
*/
EnemySeekingState.prototype.exit = function(options) {

};

goog.exportSymbol('EnemySeekingState', EnemySeekingState);