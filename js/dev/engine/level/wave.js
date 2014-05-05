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

	this.arrCurrentSpawns = null;

	this.currentOrdinal = 0;

	this.enemyTotal = 0;

	this.index = 0;

	this.spawnId = 0;

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

	this.arrCurrentSpawns = [];

	this.currentOrdinal = 1;

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

	// for(var key in this.arrEnemySystems) {
	// 	goog.events.unlisten(
	// 		this.arrEnemySystems[key],
	// 		EventNames.SPAWN_COMPLETE, 
	// 		this.onSpawnComplete, 
	// 		false, 
	// 		this
	// 	);
	// }

	this.arrEnemySystems = null;

	for(i = 0; i < this.arrSpawns.length; i++) {
		goog.events.unlisten(
			this.arrSpawns[i],
			EventNames.SPAWN_COMPLETE, 
			this.onSpawnComplete, 
			false, 
			this
		);

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

// Wave.prototype.setSpawn = function(spawn) {
// 	goog.events.listen(
// 		spawn, 
// 		EventNames.SPAWN_COMPLETE, 
// 		this.onSpawnComplete, 
// 		false,
// 		this
// 	);

// 	this.currentSpawn = spawn;

// 	//listener(s) render visual warning of impending enemy at spawn
// 	if(spawn.hasWarning()) {
// 		goog.events.dispatchEvent(this, this.warningEvent);
// 	}

// 	//render visual FX for impending enemy spawn location
// 	if(spawn.hasSpawnParticle()) {
// 		goog.events.dispatchEvent(this, this.initSpawnParticleEvent);
// 	}

// 	spawn.id = this.spawnId;
// 	this.spawnId++;

// 	spawn.generate();
// };

// Wave.prototype.setCurrentSpawns = function() {
// 	var currentSpawn = null,
// 		nextSpawn = null,
// 		maxIndex = this.length() - 1,
// 		i = 0;

// 	this.arrCurrentSpawns.length = 0;

// 	//determine a set of simultaneous Spawn instances
// 	for(i = 0; i < this.length(); i++) {
// 		currentSpawn = this.arrSpawns[i];

// 		if(currentSpawn.ordinal() === 0) {
// 			this.arrCurrentSpawns.push(currentSpawn);
// 			break;
// 		} else if(currentSpawn.ordinal() === this.currentOrdinal) {
// 			this.arrCurrentSpawns.push(currentSpawn);

// 			if(i < maxIndex) {
// 				nextSpawn = this.arrSpawns[i + 1];

// 				if(nextSpawn.ordinal() === currentSpawn.ordinal()) {
// 					continue;
// 				} else {
// 					this.currentOrdinal++;
// 					break;
// 				}
// 			}
// 		}
// 	}

// 	//init spawn generation of new consecutive (or singular if one) spawns
// 	for(i = 0; i < this.arrCurrentSpawns.length; i++) {
// 		this.setSpawn(this.arrCurrentSpawns[i]);
// 	}
// };

// Wave.prototype.getCurrentSpawns = function() {
// 	return this.arrCurrentSpawns;
// };

//EVENT HANDLERS
Wave.prototype.onSpawnComplete = function(e) {
	// var spawn = e.target;

	// //clean up listeners and prompt end of spawn
	// goog.events.unlisten(
	// 	spawn,
	// 	EventNames.SPAWN_COMPLETE, 
	// 	this.onSpawnComplete, 
	// 	false, 
	// 	this
	// );

	// if(spawn.hasSpawnParticle()) {
	// 	console.log("Wave requesting spawn particle removal");
	// 	goog.events.dispatchEvent(this, this.removeSpawnParticleEvent);
	// }
	
	// if(++this.index >= this.length()) {
	// 	goog.events.dispatchEvent(this, this.waveCompleteEvent);
	// } else {
	// 	this.setCurrentSpawns();
	// }

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