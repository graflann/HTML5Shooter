goog.provide('EnemySnipingState');

goog.require('State');
goog.require('EnemyRoamingState');
goog.require('EnemyStrafingState');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
EnemySnipingState = function(enemy) {
	this.enemy = enemy;
};

goog.inherits(EnemySnipingState, State);

EnemySnipingState.KEY = "sniping";

EnemySnipingState.NEXT_STATE_MAP = [
	"roaming",
	"strafing"
];

/**
*@public
*/
EnemySnipingState.prototype.enter = function(options) {
	//console.log("Entering state: Enemy " + EnemySnipingState.KEY);

	this.enemy.enterSniping(options);
};

/**
*@public
*/
EnemySnipingState.prototype.update = function(options) {
	this.enemy.updateSniping(options);
};

/**
*@public
*/
EnemySnipingState.prototype.exit = function(options) {
	
};

/**
*@public
*/
EnemySnipingState.prototype.clear = function() {
	this.enemy = null;
};

goog.exportSymbol('EnemySnipingState', EnemySnipingState);