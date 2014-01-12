goog.provide('EnemyTankSnipingState');

goog.require('State');
goog.require('EnemyTankRoamingState');
goog.require('EnemyTankStrafingState');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
EnemyTankSnipingState = function(enemy) {
	this.enemy = enemy;
};

goog.inherits(EnemyTankSnipingState, State);

EnemyTankSnipingState.KEY = "sniping";

EnemyTankSnipingState.NEXT_STATE_MAP = [
	"roaming",
	"strafing"
];

EnemyTankSnipingState.MIN_SNIPE_TIME = 2000;
EnemyTankSnipingState.MAX_SNIPE_TIME = 4000;

/**
*@public
*/
EnemyTankSnipingState.prototype.enter = function(options) {
	var self = this;
	var maxIndex = EnemyTankSnipingState.NEXT_STATE_MAP.length - 1;
	var randIndex = Math.randomInRangeWhole(0, maxIndex);
	var randRoamTime = Math.randomInRangeWhole(
		EnemyTankSnipingState.MIN_SNIPE_TIME, 
		EnemyTankSnipingState.MAX_SNIPE_TIME
	);

	setTimeout(function() {
		self.enemy.stateMachine.setState(EnemyTankSnipingState.NEXT_STATE_MAP[randIndex]);
	}, randRoamTime);

	this.enemy.enterSniping(options);
};

/**
*@public
*/
EnemyTankSnipingState.prototype.update = function(options) {
	this.enemy.updateSniping(options);
};

/**
*@public
*/
EnemyTankSnipingState.prototype.exit = function(options) {

};

goog.exportSymbol('EnemyTankSnipingState', EnemyTankSnipingState);