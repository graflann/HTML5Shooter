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
	this.options.ordinal			= options.ordinal || 0;
	this.options.hasWarning			= (options.hasWarning === true) ? true : false;
	this.options.hasSpawnParticle	= (options.hasSpawnParticle === true) ? true : false;

	this.id = -1;

	this.enemySystem = null;

	this.spawnCompleteEvent = new goog.events.Event(EventNames.SPAWN_COMPLETE, this);

	this.init();
};

goog.inherits(Spawn, goog.events.EventTarget);

Spawn.INTERVAL_THRESHOLD = 1000 / 60;

/**
*@public
*/
Spawn.prototype.init = function() {
	this.enemySystem = this.arrEnemySystems[this.options.type];

	goog.events.listen(
		this.enemySystem,
		EventNames.SPAWN_COMPLETE, 
		this.onSpawnComplete, 
		false, 
		this
	);
};

/**
*@public
*/
Spawn.prototype.clear = function() {
	goog.events.unlisten(
		this.enemySystem,
		EventNames.SPAWN_COMPLETE, 
		this.onSpawnComplete, 
		false, 
		this
	);

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
};

/**
*@public
*/
Spawn.prototype.getOptions = function() {
	return this.options;
};

/**
*@public
*/
Spawn.prototype.hasWarning = function() {
	return this.options.hasWarning;
};

/**
*@public
*/
Spawn.prototype.hasSpawnParticle = function() {
	return this.options.hasSpawnParticle;
};

/**
*@public
*/
Spawn.prototype.ordinal = function() {
	return this.options.ordinal;
};

//EVENT HANDLERS
Spawn.prototype.onSpawnComplete = function(e) {
	goog.events.unlisten(
		this.enemySystem,
		EventNames.SPAWN_COMPLETE, 
		this.onSpawnComplete, 
		false, 
		this
	);

	goog.events.dispatchEvent(this, this.spawnCompleteEvent);
}