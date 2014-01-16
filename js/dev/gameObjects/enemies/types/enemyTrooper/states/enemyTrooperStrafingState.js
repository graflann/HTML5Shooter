goog.provide('EnemyTrooperStrafingState');

goog.require('State');
goog.require('EnemyTankRoamingState');
goog.require('EnemyTankSnipingState');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
EnemyTrooperStrafingState = function(enemy) {
	this.enemy = enemy;
};

goog.inherits(EnemyTrooperStrafingState, State);

EnemyTrooperStrafingState.KEY = "strafing";

EnemyTrooperStrafingState.NEXT_STATE_MAP = [
	"roaming",
	"sniping"
];

EnemyTrooperStrafingState.MIN_STRAFE_TIME = 2000;
EnemyTrooperStrafingState.MAX_STRAFE_TIME = 4000;

/**
*@public
*/
EnemyTrooperStrafingState.prototype.enter = function(options) {
	var self = this;
	var maxIndex = EnemyTrooperStrafingState.NEXT_STATE_MAP.length - 1;
	var randIndex = Math.randomInRangeWhole(0, maxIndex);
	var randRoamTime = Math.randomInRangeWhole(
		EnemyTrooperStrafingState.MIN_STRAFE_TIME, 
		EnemyTrooperStrafingState.MAX_STRAFE_TIME
	);

	setTimeout(function() {
		self.enemy.stateMachine.setState(EnemyTrooperStrafingState.NEXT_STATE_MAP[randIndex]);
	}, randRoamTime);

	this.enemy.enterStrafing(options);
};

/**
*@public
*/
EnemyTrooperStrafingState.prototype.update = function(options) {
	this.enemy.updateStrafing(options);
};

/**
*@public
*/
EnemyTrooperStrafingState.prototype.exit = function(options) {
	
};

goog.exportSymbol('EnemyTrooperStrafingState', EnemyTrooperStrafingState);