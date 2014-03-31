goog.provide('EnemyStrafingState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
EnemyStrafingState = function(enemy) {
	this.enemy = enemy;
};

goog.inherits(EnemyStrafingState, State);

EnemyStrafingState.KEY = "strafing";

EnemyStrafingState.NEXT_STATE_MAP = [
	"roaming",
	"sniping"
];

/**
*@public
*/
EnemyStrafingState.prototype.enter = function(options) {
	//console.log("Entering state: Enemy " + EnemyStrafingState.KEY);

	this.enemy.enterStrafing(options);
};

/**
*@public
*/
EnemyStrafingState.prototype.update = function(options) {
	this.enemy.updateStrafing(options);
};

/**
*@public
*/
EnemyStrafingState.prototype.exit = function(options) {
	
};

/**
*@public
*/
EnemyStrafingState.prototype.clear = function() {
	this.enemy = null;
};

goog.exportSymbol('EnemyStrafingState', EnemyStrafingState);