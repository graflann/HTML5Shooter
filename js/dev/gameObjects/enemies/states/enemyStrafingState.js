goog.provide('EnemyStrafingState');

goog.require('State');
goog.require('EnemyRoamingState');
goog.require('EnemySnipingState');

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

EnemyStrafingState.MIN_STRAFE_TIME = 2000;
EnemyStrafingState.MAX_STRAFE_TIME = 4000;

/**
*@public
*/
EnemyStrafingState.prototype.enter = function(options) {
	var self = this;
	var maxIndex = EnemyStrafingState.NEXT_STATE_MAP.length - 1;
	var randIndex = Math.randomInRangeWhole(0, maxIndex);
	var randRoamTime = Math.randomInRangeWhole(
		EnemyStrafingState.MIN_STRAFE_TIME, 
		EnemyStrafingState.MAX_STRAFE_TIME
	);

	setTimeout(function() {
		self.enemy.stateMachine.setState(EnemyStrafingState.NEXT_STATE_MAP[randIndex]);
	}, randRoamTime);

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

goog.exportSymbol('EnemyStrafingState', EnemyStrafingState);