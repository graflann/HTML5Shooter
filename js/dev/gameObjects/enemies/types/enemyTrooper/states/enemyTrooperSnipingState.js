goog.provide('EnemyTrooperSnipingState');

goog.require('State');
goog.require('EnemyTankRoamingState');
goog.require('EnemyTankStrafingState');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
EnemyTrooperSnipingState = function(enemy) {
	this.enemy = enemy;
};

goog.inherits(EnemyTrooperSnipingState, State);

EnemyTrooperSnipingState.KEY = "sniping";

EnemyTrooperSnipingState.NEXT_STATE_MAP = [
	"roaming",
	"strafing"
];

EnemyTrooperSnipingState.MIN_SNIPE_TIME = 2000;
EnemyTrooperSnipingState.MAX_SNIPE_TIME = 4000;

/**
*@public
*/
EnemyTrooperSnipingState.prototype.enter = function(options) {
	var self = this;
	var maxIndex = EnemyTrooperSnipingState.NEXT_STATE_MAP.length - 1;
	var randIndex = Math.randomInRangeWhole(0, maxIndex);
	var randRoamTime = Math.randomInRangeWhole(
		EnemyTrooperSnipingState.MIN_SNIPE_TIME, 
		EnemyTrooperSnipingState.MAX_SNIPE_TIME
	);

	setTimeout(function() {
		self.enemy.stateMachine.setState(EnemyTrooperSnipingState.NEXT_STATE_MAP[randIndex]);
	}, randRoamTime);

	this.enemy.enterSniping(options);
};

/**
*@public
*/
EnemyTrooperSnipingState.prototype.update = function(options) {
	this.enemy.updateSniping(options);
};

/**
*@public
*/
EnemyTrooperSnipingState.prototype.exit = function(options) {

};

goog.exportSymbol('EnemyTrooperSnipingState', EnemyTrooperSnipingState);