goog.provide('EnemySystem');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('EventNames');
goog.require('Enemy');
goog.require('EnemyClasses');
goog.require('CollisionCategories');

/**
*@constructor
*Ammo for Turret instaces
*/
EnemySystem = function(type, max, projectileSystem, enemySystem) {
	this.type = type;

	this.max = max;

	this.projectileSystem = projectileSystem;

	this.enemySystem = enemySystem || null;

	this.arrEnemies = new Array(this.max);

	this.position = new app.b2Vec2();

	this.currentSpawnedQuantity = 0;

	this.timer = null;

	this.spawnCompleteEvent = new goog.events.Event(EventNames.SPAWN_COMPLETE, this);
	this.enemyKilledEvent = new goog.events.Event(EventNames.ENEMY_KILLED, this);

	this.init();
};

goog.inherits(EnemySystem, goog.events.EventTarget);

EnemySystem.prototype.init = function() {
	var EnemyClass = EnemyClasses[this.type],
		i = -1;

	while(++i < this.max) {

		if(this.enemySystem) {
			this.arrEnemies[i] = new EnemyClass(this.projectileSystem, this.enemySystem);
		} else {
			this.arrEnemies[i] = new EnemyClass(this.projectileSystem);
		}

		goog.events.listen(
			this.arrEnemies[i], 
			EventNames.ENEMY_KILLED, 
			this.onEnemyKilled, 
			false, 
			this
		);
	}
};

EnemySystem.prototype.update = function(options) {
	var i = -1;

	while(++i < this.max) {
		this.arrEnemies[i].update(options);
	}
};

EnemySystem.prototype.clear = function() {
	var i = -1;

	while(++i < this.max) {
		goog.events.unlisten(
			this.arrEnemies[i], 
			EventNames.ENEMY_KILLED, 
			this.onEnemyKilled, 
			false, 
			this
		);

		this.arrEnemies[i].clear();
		this.arrEnemies[i] = null;
	}

	this.arrEnemies = null;

	this.projectileSystem = null;

	this.enemySystem = null;

	this.position = null;

	this.spawnCompleteEvent = null;
	this.enemyKilledEvent = null;
};

EnemySystem.prototype.kill = function() {
	var i = -1;

	//clears the spawn timer
	if(this.timer) {
		clearTimeout(this.timer);
		this.timer = null;
	}

	while(++i < this.max) {
		this.arrEnemies[i].kill();
	}
};

EnemySystem.prototype.generate = function(options) {
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
		enemy = this.getEnemy();
		
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

EnemySystem.prototype.generateByTime = function(options) {
	var self = this,
		options = options || {},
		quantityDifference;

	options.type 				= options.type || EnemyTypes.DRONE;
	options.intervalTime 		= options.intervalTime || 0;
	options.intervalQuantity 	= options.intervalQuantity || 1;
	options.targetQuantity 		= options.targetQuantity || 1;

	var onTimeOut = function () {
		self.generate(options);

		if(options.targetQuantity > 0) {
			self.currentSpawnedQuantity += options.intervalQuantity;
		}

		if(self.currentSpawnedQuantity < options.targetQuantity) {
			quantityDifference = options.targetQuantity - self.currentSpawnedQuantity;

			//trim the interval qty to match the target if necessary
			if(quantityDifference < options.intervalQuantity) {
				options.intervalQuantity = quantityDifference;
			}

			self.generateByTime(options);
		} else {
			self.currentSpawnedQuantity = 0;
			goog.events.dispatchEvent(self, self.spawnCompleteEvent);
		}
	};

	if (options.targetQuantity <= this.max || options.intervalQuantity <= this.max) {
		this.timer = setTimeout(onTimeOut, options.intervalTime);	
	} else {
		throw "Target quantity or interval quantity cannot exceed max quantity.";
	}
};

EnemySystem.prototype.getEnemy = function() {
	var enemy,
		i = -1;
			
	while (++i < this.max) {
		enemy = this.arrEnemies[i];

		if (!enemy.isAlive) {
			return enemy;
		}
	}
	
	return null;
};

EnemySystem.prototype.length = function() {
	return this.arrEnemies.length;
};

EnemySystem.prototype.removeReticles = function() {
	var enemy,
		i = -1;
			
	while (++i < this.max) {
		enemy = this.arrEnemies[i];

		if (enemy.isAlive) {
			if(enemy instanceof EnemyCarrier) {
				enemy.removeReticles();
			} else {
				if(enemy.reticle) {
					enemy.reticle.kill();
					enemy.reticle = null;
				}
			}			
		}
	}
};

EnemySystem.prototype.onEnemyKilled = function(e) {
	goog.events.dispatchEvent(this, this.enemyKilledEvent);
};
