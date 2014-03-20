goog.provide('EnemyRoamingState');

goog.require('State');
goog.require('EnemySnipingState');
goog.require('EnemyStrafingState');

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

EnemyRoamingState.MIN_ROAM_TIME = 4000;
EnemyRoamingState.MAX_ROAM_TIME = 6000;

/**
*@public
*/
EnemyRoamingState.prototype.enter = function(options) {
	//console.log("Entering state: Enemy " + EnemyRoamingState.KEY);

	var self = this;
	var maxIndex = EnemyRoamingState.NEXT_STATE_MAP.length - 1;
	var randIndex = Math.randomInRangeWhole(0, maxIndex);
	var randRoamTime = Math.randomInRangeWhole(
		EnemyRoamingState.MIN_ROAM_TIME, 
		EnemyRoamingState.MAX_ROAM_TIME
	);

	this.enemy.clearTimer();

	this.enemy.timer = setTimeout(function() {
		self.enemy.stateMachine.setState(EnemyRoamingState.NEXT_STATE_MAP[randIndex]);
	}, randRoamTime);

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