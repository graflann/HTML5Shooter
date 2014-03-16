goog.provide('Spawn');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');

/**
*@constructor
*/
Spawn = function(arrEnemySystems, options) {
	this.arrEnemySystems = arrEnemySystems;

	this.options = options || {};

	this.options.type 				= options.type || EnemyTypes.DRONE;
	this.options.intervalTime 		= options.intervalTime || 0;
	this.options.intervalQuantity 	= options.intervalQuantity || 1;
	this.options.targetQuantity 	= options.targetQuantity || 1;
	this.options.positionX 			= options.positionX || 0;
	this.options.positionY			= options.positionY || 0;

	this.enemySystem = null;

	this.init();
};

goog.inherits(Spawn, goog.events.EventTarget);

/**
*@public
*/
Spawn.prototype.init = function() {
	this.enemySystem = this.arrEnemySystems[this.options.type];
};

/**
*@public
*/
Spawn.prototype.clear = function() {
	this.arrEnemySystems = null;

	this.options = null;

	this.enemySystem = null;
};

/**
*@public
*/
Spawn.prototype.generate = function() {
	var intervalThreshold = 1000 / 60;

	if(this.options.intervalTime > intervalThreshold) {
		this.enemySystem.generateByTime(this.options);
	} else {
		this.enemySystem.generate(this.options);
		goog.events.dispatchEvent(this.enemySystem, this.enemySystem.spawnCompleteEvent);
	}
};