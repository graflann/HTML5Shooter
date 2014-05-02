goog.provide('Wave');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('EventNames');
goog.require('PayloadEvent');
goog.require('Spawn');

/**
*@constructor
*/
Wave = function(arrRawSpawns, arrEnemySystems) {
	this.arrRawSpawns = arrRawSpawns;

	this.arrEnemySystems = arrEnemySystems;

	this.arrSpawns = [];

	this.currentSpawn = null;

	this.enemyTotal = 0;

	this.index = 0;

	this.waveCompleteEvent = new goog.events.Event(EventNames.WAVE_COMPLETE, this);
	this.warningEvent = new goog.events.Event(EventNames.INIT_WARNING, this);
	this.initSpawnParticleEvent = new goog.events.Event(EventNames.INIT_SPAWN_PARTICLE, this);
	this.removeSpawnParticleEvent = new goog.events.Event(EventNames.REMOVE_SPAWN_PARTICLE, this);

	this.init();
};

goog.inherits(Wave, goog.events.EventTarget);

/**
*@public
*/
Wave.prototype.init = function() {

	for(var i = 0; i < this.arrRawSpawns.length; i++) {
		this.arrSpawns.push(new Spawn(this.arrEnemySystems, this.arrRawSpawns[i]));

		
		this.enemyTotal += this.arrRawSpawns[i].targetQuantity;
	}
};

/**
*@public
*/
Wave.prototype.clear = function() {
	var i = 0;

	for(var key in this.arrEnemySystems) {
		goog.events.unlisten(
			this.arrEnemySystems[key],
			EventNames.SPAWN_COMPLETE, 
			this.onSpawnComplete, 
			false, 
			this
		);
	}
	this.arrEnemySystems = null;

	for(var i = 0; i < this.arrSpawns.length; i++) {
		this.arrSpawns[i].clear();
		this.arrSpawns[i] = null;
	}
	this.arrSpawns = null;

	this.currentSpawn = null;

	this.waveCompleteEvent = null;
	this.warningEvent = null;
	this.initSpawnParticleEvent = null;
	this.removeSpawnParticleEvent = null;
};

Wave.prototype.length = function() {
	return this.arrSpawns.length;
};

Wave.prototype.getCurrentSpawn = function() {
	return this.currentSpawn;
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

	//listener(s) render visual warning of impending enemy at spawn
	if(this.currentSpawn.hasWarning()) {
		goog.events.dispatchEvent(this, this.warningEvent);
	}

	//render visual FX for impending enemy spawn location
	if(this.currentSpawn.hasSpawnParticle()) {
		goog.events.dispatchEvent(this, this.initSpawnParticleEvent);
	}

	this.currentSpawn.generate();
};

//EVENT HANDLERS
Wave.prototype.onSpawnComplete = function(e) {
	if(this.currentSpawn.hasSpawnParticle()) {
		console.log("Wave requesting spawn particle removal");
		goog.events.dispatchEvent(this, this.removeSpawnParticleEvent);
	}
	
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