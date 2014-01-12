goog.provide('EnemyTankRoamingState');

goog.require('State');
goog.require('EnemyTankSnipingState');
goog.require('EnemyTankStrafingState');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
EnemyTankRoamingState = function(enemy) {
	this.enemy = enemy;
};

goog.inherits(EnemyTankRoamingState, State);

EnemyTankRoamingState.KEY = "roaming";

EnemyTankRoamingState.NEXT_STATE_MAP = [
	"sniping",
	"strafing"
];

EnemyTankRoamingState.MIN_ROAM_TIME = 4000;
EnemyTankRoamingState.MAX_ROAM_TIME = 6000;

/**
*@public
*/
EnemyTankRoamingState.prototype.enter = function(options) {
	var self = this;
	var maxIndex = EnemyTankRoamingState.NEXT_STATE_MAP.length - 1;
	var randIndex = Math.randomInRangeWhole(0, maxIndex);
	var randRoamTime = Math.randomInRangeWhole(
		EnemyTankRoamingState.MIN_ROAM_TIME, 
		EnemyTankRoamingState.MAX_ROAM_TIME
	);

	setTimeout(function() {
		self.enemy.stateMachine.setState(EnemyTankRoamingState.NEXT_STATE_MAP[randIndex]);
	}, randRoamTime);

	this.enemy.enterRoaming(options);
};

/**
*@public
*/
EnemyTankRoamingState.prototype.update = function(options) {
	this.enemy.updateRoaming(options);
};

/**
*@public
*/
EnemyTankRoamingState.prototype.exit = function(options) {

};

goog.exportSymbol('EnemyTankRoamingState', EnemyTankRoamingState);