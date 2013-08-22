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

	this.setCurrentWave();
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
	}
};

WaveManager.prototype.length = function() {
	return this.arrWaves.length;
};

WaveManager.prototype.setCurrentWave = function() {
	console.log("Current Wave: " + this.index);

	this.currentWave = this.arrWaves[this.index];

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
	if(++this.index >= this.length()) {
		//clean up listener and prompt end of wave
		goog.events.unlisten(
			this.currentWave,
			EventNames.WAVE_COMPLETE, 
			this.onWaveComplete, 
			false, 
			this
		);

		goog.events.dispatchEvent(this, this.levelCompleteEvent);
	} else {
		goog.events.unlisten(
			this.currentWave,
			EventNames.WAVE_COMPLETE, 
			this.onWaveComplete, 
			false, 
			this
		);

		this.setCurrentWave();
	}
};