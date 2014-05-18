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
	this.options.hasWarning			= (options.hasWarning === undefined || options.hasWarning === null) ? false : options.hasWarning;
	this.options.hasSpawnParticle	= (options.hasSpawnParticle === undefined || options.hasSpawnParticle === null) ? false : options.hasSpawnParticle;

	this.id = -1;

	this.position = null;

	this.enemySystem = null;

	this.currentSpawnedQuantity = 0;

	this.timer = null;

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

	this.position = new app.b2Vec2();

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

	this.position = null;

	if(this.timer) {
		clearTimeout(this.timer);
		this.timer = null;
	}

	this.options = null;

	this.enemySystem = null;
};

/**
*@public
*/
Spawn.prototype.generate = function() {
	if(this.options.intervalTime > Spawn.INTERVAL_THRESHOLD) {
		this.generateEnemyByTime(this.options);
	} else {
		this.generateEnemy(this.options);
		goog.events.dispatchEvent(this.enemySystem, this.enemySystem.spawnCompleteEvent);
	}
};

Spawn.prototype.generateEnemy = function(options) {
	var i = -1,
		enemy,
		arrEnemies = [],
		options = options || {};
		
	options.intervalQuantity = options.intervalQuantity || 1;
	options.posOffsetX 	= options.posOffsetX || 0,
	options.posOffsetY 	= options.posOffsetY || 0;
	options.positionX = options.positionX || 0;
	options.positionY = options.positionY || 0;

	this.position.x = options.positionX;
	this.position.y = options.positionY;

	while (++i < options.intervalQuantity) {
		enemy = this.enemySystem.getEnemy();
		
		if (enemy) {

			//set enemy position; varies by type
			if(enemy instanceof EnemyCentipede) {
				enemy.add();

				enemy.setPosition(
					new app.b2Vec2(
						(this.position.x + 
							Math.randomInRange(-options.posOffsetX, options.posOffsetX)) /
							app.physicsScale,
						(this.position.y + 
							Math.randomInRange(-options.posOffsetY, options.posOffsetY)) /
							app.physicsScale
					)
				);
			} else {
				enemy.setPosition(
					this.position.x + Math.randomInRange(-options.posOffsetX, options.posOffsetX),
					this.position.y + Math.randomInRange(-options.posOffsetY, options.posOffsetY)
				);
			}

			//set target layer for Enemy container; foreground for air, main for ground
			if(enemy.getCategoryBits() === CollisionCategories.AIR_ENEMY) {
				app.layers.getStage(LayerTypes.AIR).addChild(enemy.container);

				if(enemy.shadow != null) {
					app.layers.getStage(LayerTypes.SHADOW).addChild(enemy.shadow.container);
				}
			} else {
				app.layers.getStage(LayerTypes.MAIN).addChild(enemy.container);
			}

			enemy.setIsAlive(true);

			//notify the wavemanager of this enemy's kill as a default;
			//this may be changed by other spawn entities outside the general wave spawn scope (eg EnemyCarrier)
			//as those entities or generators spawn until they are killed
			enemy.isWaveEnabled = true;

			arrEnemies.push(enemy);
		}
	}

	return arrEnemies;
};

Spawn.prototype.generateEnemyByTime = function(options) {
	var self = this,
		options = options || {},
		quantityDifference;

	options.type 				= options.type;
	options.intervalTime 		= options.intervalTime || 0;
	options.intervalQuantity 	= options.intervalQuantity || 1;
	options.targetQuantity 		= options.targetQuantity || 1;

	var onTimeOut = function () {
		self.generateEnemy(options);

		if(options.targetQuantity > 0) {
			self.currentSpawnedQuantity += options.intervalQuantity;
		}

		if(self.currentSpawnedQuantity < options.targetQuantity) {
			quantityDifference = options.targetQuantity - self.currentSpawnedQuantity;

			//trim the interval qty to match the target if necessary
			if(quantityDifference < options.intervalQuantity) {
				options.intervalQuantity = quantityDifference;
			}

			self.generateEnemyByTime(options);
		} else {
			self.currentSpawnedQuantity = 0;
			goog.events.dispatchEvent(self.enemySystem, self.enemySystem.spawnCompleteEvent);
		}
	};

	if (options.targetQuantity <= this.enemySystem.max || options.intervalQuantity <= this.enemySystem.smax) {
		this.timer = setTimeout(onTimeOut, options.intervalTime);	
	} else {
		throw "Target quantity or interval quantity cannot exceed max quantity.";
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