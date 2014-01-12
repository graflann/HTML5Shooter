goog.provide('EnemyTankStrafingState');

goog.require('State');
goog.require('EnemyTankRoamingState');
goog.require('EnemyTankSnipingState');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
EnemyTankStrafingState = function(enemy) {
	this.enemy = enemy;
};

goog.inherits(EnemyTankStrafingState, State);

EnemyTankStrafingState.KEY = "strafing";

EnemyTankStrafingState.NEXT_STATE_MAP = [
	"roaming",
	"sniping"
];

EnemyTankStrafingState.MIN_STRAFE_TIME = 2000;
EnemyTankStrafingState.MAX_STRAFE_TIME = 4000;

/**
*@public
*/
EnemyTankStrafingState.prototype.enter = function(options) {
	var self = this;
	var maxIndex = EnemyTankStrafingState.NEXT_STATE_MAP.length - 1;
	var randIndex = Math.randomInRangeWhole(0, maxIndex);
	var randRoamTime = Math.randomInRangeWhole(
		EnemyTankStrafingState.MIN_STRAFE_TIME, 
		EnemyTankStrafingState.MAX_STRAFE_TIME
	);

	setTimeout(function() {
		self.enemy.stateMachine.setState(EnemyTankStrafingState.NEXT_STATE_MAP[randIndex]);
	}, randRoamTime);

	this.enemy.enterStrafing(options);
};

/**
*@public
*/
EnemyTankStrafingState.prototype.update = function(options) {
	this.enemy.updateStrafing(options);
};

/**
*@public
*/
EnemyTankStrafingState.prototype.exit = function(options) {
	
};

goog.exportSymbol('EnemyTankStrafingState', EnemyTankStrafingState);