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
	this.options.hasWarning			= (options.hasWarning === true) ? true : false;

	this.enemySystem = null;

	this.warningEvent = new goog.events.Event(EventNames.INIT_WARNING, this);

	this.init();
};

goog.inherits(Spawn, goog.events.EventTarget);

Spawn.INTERVAL_THRESHOLD = 1000 / 60;

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
	if(this.options.intervalTime > Spawn.INTERVAL_THRESHOLD) {
		this.enemySystem.generateByTime(this.options);
	} else {
		this.enemySystem.generate(this.options);
		goog.events.dispatchEvent(this.enemySystem, this.enemySystem.spawnCompleteEvent);
	}

	console.log("Options warning is: " + this.options.hasWarning.toString());

	//listener(s) render visual warning of impending enemy at spawn
	if(this.options.hasWarning) {
		goog.events.dispatchEvent(this, this.warningEvent);
	}
};

/**
*@public
*/
Spawn.prototype.hasWarning = function() {
	return this.options.hasWarning;
};