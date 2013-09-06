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
	var deg = Math.randomInRange(0, 360),
		trigTable = app.trigTable;

	//Set retreat target to a random spot with a radius of screen dimensions
	this.enemy.retreatTarget.x = this.enemy.position.x + (trigTable.cos(deg) * Constants.WIDTH);
	this.enemy.retreatTarget.y = this.enemy.position.y + (trigTable.sin(deg) * Constants.HEIGHT);
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