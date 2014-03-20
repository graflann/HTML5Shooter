goog.provide('WaveManager');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('EventNames');
goog.require('Wave');

/**
*@constructor
*/
WaveManager = function(arrRawWaves, arrEnemySystems) {
	this.arrRawWaves = arrRawWaves;

	this.arrEnemySystems = arrEnemySystems;

	this.arrWaves = [];

	this.currentWave = null;

	this.numWaveEnemyKilled = 0;

	this.index = 0;

	this.levelCompleteEvent = new goog.events.Event(EventNames.LEVEL_COMPLETE, this);

	this.init();
};

goog.inherits(WaveManager, goog.events.EventTarget);

/**
*@public
*/
WaveManager.prototype.init = function() {
	for(var i = 0; i < this.arrRawWaves.length; i++) {
		this.arrWaves.push(new Wave(this.arrRawWaves[i], this.arrEnemySystems));
	}

	for(var key in this.arrEnemySystems) {
		goog.events.listen(
			this.arrEnemySystems[key], 
			EventNames.ENEMY_KILLED, 
			this.onEnemyKilled, 
			false, 
			this
		);
	}
};

/**
*@public
*/
WaveManager.prototype.clear = function() {
	for(var i = 0; i < this.arrWaves.length; i++) {
		goog.events.unlisten(
			this.arrWaves[i],
			EventNames.WAVE_COMPLETE, 
			this.onWaveComplete, 
			false, 
			this
		);

		this.arrWaves[i].clear();
		this.arrWaves[i] = null;
	}
	this.arrWaves = null;

	this.arrRawWaves = null;

	this.arrEnemySystems = null;

	this.currentWave = null;

	this.levelCompleteEvent = null;
};

/**
*@public
*/
WaveManager.prototype.kill = function() {
	for(var key in this.arrEnemySystems) {
		goog.events.unlisten(
			this.arrEnemySystems[key], 
			EventNames.ENEMY_KILLED, 
			this.onEnemyKilled, 
			false, 
			this
		);
	}

	for(var i = 0; i < this.arrWaves.length; i++) {
		goog.events.unlisten(
			this.arrWaves[i],
			EventNames.WAVE_COMPLETE, 
			this.onWaveComplete, 
			false, 
			this
		);
	}
};

WaveManager.prototype.length = function() {
	return this.arrWaves.length;
};

WaveManager.prototype.setCurrentWave = function() {
	console.log("Current Wave: " + this.index);

	this.currentWave = this.arrWaves[this.index];

	this.numWaveEnemyKilled = 0;

	goog.events.listen(
		this.currentWave, 
		EventNames.WAVE_COMPLETE, 
		this.onWaveComplete, 
		false, 
		this
	);

	this.currentWave.setCurrentSpawn();
};

//EVENT HANDLERS
WaveManager.prototype.onWaveComplete = function(e) {
	//TODO:This has become vestigial for now
	//clean up listener and prompt end of wave
	goog.events.unlisten(
		this.currentWave,
		EventNames.WAVE_COMPLETE, 
		this.onWaveComplete, 
		false, 
		this
	);
};

WaveManager.prototype.onEnemyKilled = function(e) {
	++this.numWaveEnemyKilled;

	console.log("Enemies killed: " + this.numWaveEnemyKilled);

	if(this.numWaveEnemyKilled >= this.currentWave.enemyTotal) {

		console.log("# of wave enemy killed: " + this.numWaveEnemyKilled);

		if(++this.index >= this.length()) {
			for(var key in this.arrEnemySystems) {
				//remove enemy system listeners
				goog.events.unlisten(
					this.arrEnemySystems[key], 
					EventNames.ENEMY_KILLED, 
					this.onEnemyKilled, 
					false, 
					this
				);
			}

			goog.events.dispatchEvent(this, this.levelCompleteEvent);
		} else {
			this.setCurrentWave();
		}
	}
};