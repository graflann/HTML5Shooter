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

EnemySnipingState.MIN_SNIPE_TIME = 2000;
EnemySnipingState.MAX_SNIPE_TIME = 4000;

/**
*@public
*/
EnemySnipingState.prototype.enter = function(options) {
	//console.log("Entering state: Enemy " + EnemySnipingState.KEY);

	var self = this;
	var maxIndex = EnemySnipingState.NEXT_STATE_MAP.length - 1;
	var randIndex = Math.randomInRangeWhole(0, maxIndex);
	var randRoamTime = Math.randomInRangeWhole(
		EnemySnipingState.MIN_SNIPE_TIME, 
		EnemySnipingState.MAX_SNIPE_TIME
	);

	this.enemy.clearTimer();

	this.enemy.timer = setTimeout(function() {
		self.enemy.stateMachine.setState(EnemySnipingState.NEXT_STATE_MAP[randIndex]);
	}, randRoamTime);

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