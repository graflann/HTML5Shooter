goog.provide('EnemyRoamingState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
EnemyRoamingState = function(enemy) {
	this.enemy = enemy;
};

goog.inherits(EnemyRoamingState, State);

EnemyRoamingState.KEY = "roaming";

EnemyRoamingState.NEXT_STATE_MAP = [
	"sniping",
	"strafing"
];

/**
*@public
*/
EnemyRoamingState.prototype.enter = function(options) {
	//console.log("Entering state: Enemy " + EnemyRoamingState.KEY);

	this.enemy.enterRoaming(options);
};

/**
*@public
*/
EnemyRoamingState.prototype.update = function(options) {
	this.enemy.updateRoaming(options);
};

/**
*@public
*/
EnemyRoamingState.prototype.exit = function(options) {

};

/**
*@public
*/
EnemyRoamingState.prototype.clear = function() {
	this.enemy = null;
};

goog.exportSymbol('EnemyRoamingState', EnemyRoamingState);