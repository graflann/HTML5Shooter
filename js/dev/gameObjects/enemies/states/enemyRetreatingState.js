goog.provide('EnemyRetreatingState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
EnemyRetreatingState = function(enemy) {
	this.enemy = enemy;
};

goog.inherits(EnemyRetreatingState, State);

EnemyRetreatingState.KEY = "retreating";

/**
*@public
*/
EnemyRetreatingState.prototype.enter = function(options) {
	this.enemy.enterRetreating(options);
};

/**
*@public
*/
EnemyRetreatingState.prototype.update = function(options) {
	this.enemy.updateRetreating(options);
};

/**
*@public
*/
EnemyRetreatingState.prototype.exit = function(options) {

};

/**
*@public
*/
EnemyRetreatingState.prototype.clear = function() {
	this.enemy = null;
};

goog.exportSymbol('EnemyRetreatingState', EnemyRetreatingState);