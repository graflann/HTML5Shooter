goog.provide('EnemyTrooperRoamingState');

goog.require('State');
goog.require('EnemyTankSnipingState');
goog.require('EnemyTankStrafingState');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
EnemyTrooperRoamingState = function(enemy) {
	this.enemy = enemy;
};

goog.inherits(EnemyTrooperRoamingState, State);

EnemyTrooperRoamingState.KEY = "roaming";

EnemyTrooperRoamingState.NEXT_STATE_MAP = [
	"sniping",
	"strafing"
];

EnemyTrooperRoamingState.MIN_ROAM_TIME = 4000;
EnemyTrooperRoamingState.MAX_ROAM_TIME = 6000;

/**
*@public
*/
EnemyTrooperRoamingState.prototype.enter = function(options) {
	var self = this;
	var maxIndex = EnemyTrooperRoamingState.NEXT_STATE_MAP.length - 1;
	var randIndex = Math.randomInRangeWhole(0, maxIndex);
	var randRoamTime = Math.randomInRangeWhole(
		EnemyTrooperRoamingState.MIN_ROAM_TIME, 
		EnemyTrooperRoamingState.MAX_ROAM_TIME
	);

	setTimeout(function() {
		self.enemy.stateMachine.setState(EnemyTrooperRoamingState.NEXT_STATE_MAP[randIndex]);
	}, randRoamTime);

	this.enemy.enterRoaming(options);
};

/**
*@public
*/
EnemyTrooperRoamingState.prototype.update = function(options) {
	this.enemy.updateRoaming(options);
};

/**
*@public
*/
EnemyTrooperRoamingState.prototype.exit = function(options) {

};

goog.exportSymbol('EnemyTrooperRoamingState', EnemyTrooperRoamingState);