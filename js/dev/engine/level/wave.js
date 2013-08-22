goog.provide('Wave');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('EventNames');
goog.require('Spawn');

/**
*@constructor
*/
Wave = function(arrRawSpawns, arrEnemySystems) {
	this.arrRawSpawns = arrRawSpawns;

	this.arrEnemySystems = arrEnemySystems;

	this.arrSpawns = [];

	this.currentSpawn = null;

	this.index = 0;

	this.waveCompleteEvent = new goog.events.Event(EventNames.WAVE_COMPLETE, this);

	this.init();
};

goog.inherits(Wave, goog.events.EventTarget);

/**
*@public
*/
Wave.prototype.init = function() {

	for(var i = 0; i < this.arrRawSpawns.length; i++) {
		this.arrSpawns.push(new Spawn(this.arrEnemySystems, this.arrRawSpawns[i]));
	}
};

/**
*@public
*/
Wave.prototype.clear = function() {
	for(var key in this.arrEnemySystems) {
		goog.events.unlisten(
			this.arrEnemySystems[key],
			EventNames.SPAWN_COMPLETE, 
			this.onSpawnComplete, 
			false, 
			this
		);
	}
};

Wave.prototype.length = function() {
	return this.arrSpawns.length;
};

Wave.prototype.setCurrentSpawn = function() {
	console.log("Current Spawn: " + this.index);

	this.currentSpawn = this.arrSpawns[this.index];

	goog.events.listen(
		this.currentSpawn.enemySystem, 
		EventNames.SPAWN_COMPLETE, 
		this.onSpawnComplete, 
		false, 
		this
	);

	this.currentSpawn.generate();
};

//EVENT HANDLERS
Wave.prototype.onSpawnComplete = function(e) {
	if(++this.index >= this.length()) {
		//clean up listeners and prompt end of spawn
		goog.events.unlisten(
			this.currentSpawn.enemySystem,
			EventNames.SPAWN_COMPLETE, 
			this.onSpawnComplete, 
			false, 
			this
		);

		goog.events.dispatchEvent(this, this.waveCompleteEvent);
	} else {
		this.setCurrentSpawn();
	}
};