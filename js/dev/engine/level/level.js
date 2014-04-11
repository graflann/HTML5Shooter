goog.provide('Level');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('PayloadEvent');
goog.require('EventNames');
goog.require('WaveManager');
goog.require('ProjectileSystem');
goog.require('ProjectileTypes');
goog.require('EnemySystem');
goog.require('EnemyTypes');
goog.require('SceneObjectClasses');
goog.require('SceneObjectTypes');
goog.require('CollisionCategories');
goog.require('PathFinder');

/**
*@constructor
*/
Level = function(data) {

	//this.data = {
		// dimensions: { 
		// 	width: Constants.WIDTH * 4, 
		// 	height: Constants.HEIGHT * 2
		// },
		// enemies: {
		// 	enemyTank: {
		// 		max: 64,
		// 		projectileSystem: "ground"
		// 	},

		// 	enemyTrooper: {
		// 		max: 64,
		// 		projectileSystem: "ground"
		// 	},

		// 	enemyCentipede: {
		// 		max: 16,
		// 		projectileSystem: "ground"
		// 	},

		// 	enemyTurret: {
		// 		max: 32, projectileSystem: "air"
		// 	},

		// 	enemyCopter: {
		// 		max: 16,
		// 		projectileSystem: "air"
		// 	},

		// 	 enemyCarrier: {
		// 	 	max: 1,
		// 	 	projectileSystem: "air"
		// 	 }
		// },
		// waves : [
		// 	[
		// 		{ 
		// 			type: "enemyTrooper", intervalTime: 1000, intervalQuantity: 1, targetQuantity: 16,
		// 			positionX: 32, positionY: 32, posOffsetX: 64, posOffsetY: 64
		// 		}
		// 	],
			// [
			// 	{ 
			// 		type: "enemyCentipede", intervalTime: 1, intervalQuantity: 1, targetQuantity: 1,
			// 		positionX: 240, positionY: 320
			// 	}
			// ],
			// [
			// 	{ 
			// 		type: "enemyTank", intervalTime: 1000, intervalQuantity: 1, targetQuantity: 1,
			// 		positionX: 0, positionY: -64, posOffsetX: 64, posOffsetY: 64
			// 	}
			// ],
			// [
			// 	{ 
			// 		type: "enemyCopter", intervalTime: 1000, intervalQuantity: 1, targetQuantity: 1,
			// 		positionX: -240, positionY: 64
			// 	}
			// ],
			// [
			// 	{ 
			// 		type: "enemyCarrier", intervalTime: 1000, intervalQuantity: 1, targetQuantity: 1,
			// 		positionX: -240, positionY: 64
			// 	}
			// ]
		// ],
		// sceneObjects: {
		// 	wall: [
		// 		{ 	
		// 			width: Constants.UNIT * 4 + 16,
		// 			height: Constants.UNIT * 4 + 16,
		// 			color: Constants.BLUE,
		// 			numFloors: 7,
		// 			x: 248, 
		// 			y: 208
		// 		},
		// 		{ 	
		// 			width: Constants.UNIT,
		// 			height: Constants.UNIT * 4,
		// 			color: Constants.BLUE,
		// 			numFloors: 4,
		// 			x: 512, 
		// 			y: 128
		// 		}
		// 	 ],
			// tower: [
			// 	{ 	
			// 		width: Constants.UNIT,
			// 		height: Constants.UNIT,
			// 		color: Constants.BLUE,
			// 		enemy: "enemyTurret", 
			// 		x: Constants.WIDTH * 0.5 - (Constants.UNIT * 0.5), 
			// 		y: Constants.HEIGHT * 0.5  - (Constants.UNIT * 0.5)
			// 	}
			// ]
		//;}
	//};

	/**
	*External JSON object provided by a LevelProxy instance
	*/
	this.data = data;

	this.waveManager = null;

	this.arrEnemySystems = [];

	this.arrEnemyProjectileSystems = [];

	/**
	*@type {Array.<SceneObject>}
	*/
	this.arrSceneObjects = [];

	this.init();
};

goog.inherits(Level, goog.events.EventTarget);

/**
*@public
*/
Level.prototype.init = function() {

	this.setProjectiles();
	this.setEnemies();
	this.setSceneObjects();
	this.setGraph();

	this.waveManager = new WaveManager(
		this.data.waves, 
		this.arrEnemySystems
	);

	goog.events.listen(
		this.waveManager, 
		EventNames.LEVEL_COMPLETE, 
		this.onLevelComplete, 
		false, 
		this
	);

	goog.events.listen(
		this.waveManager, 
		EventNames.INIT_WARNING, 
		this.onInitWarning, 
		false, 
		this
	);

	goog.events.listen(
		this.waveManager, 
		EventNames.INIT_SPAWN_PARTICLE, 
		this.onInitSpawnParticle, 
		false, 
		this
	);

	goog.events.listen(
		this.waveManager, 
		EventNames.REMOVE_SPAWN_PARTICLE, 
		this.onRemoveSpawnParticle, 
		false, 
		this
	);
};

/**
*@public
*/
Level.prototype.update = function(options) {
	this.updateEnemies(options);
	this.updateProjectiles(options);
	this.updateSceneObjects(options);
};

/**
*@public
*/
Level.prototype.clear = function() {
	var key;

	this.data = null;

	goog.events.unlisten(
		this.waveManager, 
		EventNames.LEVEL_COMPLETE, 
		this.onLevelComplete, 
		false, 
		this
	);

	goog.events.unlisten(
		this.waveManager, 
		EventNames.INIT_WARNING, 
		this.onInitWarning, 
		false, 
		this
	);

	goog.events.unlisten(
		this.waveManager, 
		EventNames.INIT_SPAWN_PARTICLE, 
		this.onInitSpawnParticle, 
		false, 
		this
	);

	goog.events.unlisten(
		this.waveManager, 
		EventNames.REMOVE_SPAWN_PARTICLE, 
		this.onRemoveSpawnParticle, 
		false, 
		this
	);

	this.waveManager.clear();
	this.waveManager = null;

	for(key in this.arrEnemySystems) {
		goog.events.unlisten(
			this.arrEnemySystems[key], 
			EventNames.FORCED_KILL, 
			this.onForcedKill, 
			false, 
			this
		);

		this.arrEnemySystems[key].clear();
		this.arrEnemySystems[key] = null;
	}
	this.arrEnemySystems = null;

	for(key in this.arrEnemyProjectileSystems) {
		this.arrEnemyProjectileSystems[key].clear();
		this.arrEnemyProjectileSystems[key] = null;
	}
	this.arrEnemyProjectileSystems = null;

	for(key in this.arrSceneObjects) {
		this.arrSceneObjects[key].clear();
		this.arrSceneObjects[key] = null;
	}
	this.arrSceneObjects = null;

};

Level.prototype.startWaves = function() {
	this.waveManager.setCurrentWave();
};

Level.prototype.removeReticles = function() {
	for(var key in this.arrEnemySystems) {
		this.arrEnemySystems[key].removeReticles();
	}
};

/**
*@public
*/
Level.prototype.updateEnemies = function(options) {
	for(var key in this.arrEnemySystems) {
		this.arrEnemySystems[key].update(options);
	}
};

/**
*@public
*/
Level.prototype.updateProjectiles = function(options) {
	for(var key in this.arrEnemyProjectileSystems) {
		this.arrEnemyProjectileSystems[key].update(options);
	}
};

/**
*@public
*/
Level.prototype.updateSceneObjects = function(options) {
	var i = -1,
		length = this.arrSceneObjects.length;

	while(++i < length) {
		this.arrSceneObjects[i].update(options);
	}
};

/**
*@public
*/
Level.prototype.kill = function() {
	this.waveManager.kill();

	for(var key in this.arrEnemySystems) {
		this.arrEnemySystems[key].kill();
	}
};

/**
*@private
*/
Level.prototype.setProjectiles = function() {
	//Ground enemy pool
	this.arrEnemyProjectileSystems["ground"] = new ProjectileSystem(
		ProjectileTypes.ENEMY, 
		[Constants.RED],
		32,
		CollisionCategories.GROUND_ENEMY_PROJECTILE,
		CollisionCategories.PLAYER | CollisionCategories.SCENE_OBJECT
	);

	//Air enemy pool
	this.arrEnemyProjectileSystems["air"] = new ProjectileSystem(
		ProjectileTypes.ENEMY, 
		[Constants.YELLOW],
		32,
		CollisionCategories.AIR_ENEMY_PROJECTILE,
		CollisionCategories.PLAYER
	);

	//Mine pool
	this.arrEnemyProjectileSystems[ProjectileTypes.MINE] = new ProjectileSystem(
		ProjectileTypes.MINE, 
		[Constants.YELLOW, Constants.RED],
		16,
		CollisionCategories.GROUND_ENEMY_PROJECTILE,
		CollisionCategories.PLAYER,
		this.arrEnemyProjectileSystems["ground"]
	);
};

/**
*@private
*/
Level.prototype.setEnemies = function() {
	var rawEnemy;

	for(var key in this.data.enemies) {
		rawEnemy = this.data.enemies[key];

		//EnemyCarrier instances spawn EnemyCopter instances
		//this needs refactoring to be more elegant at some point...
		if(key === "enemyCarrier") {
			this.arrEnemySystems[key] = new EnemySystem(
				key, 
				rawEnemy.max, 
				this.arrEnemyProjectileSystems[rawEnemy.projectileSystem],
				this.arrEnemySystems["enemyCopter"]
			);
		} else {
			this.arrEnemySystems[key] = new EnemySystem(
				key, 
				rawEnemy.max, 
				this.arrEnemyProjectileSystems[rawEnemy.projectileSystem] 
			);
		}

		goog.events.listen(
			this.arrEnemySystems[key], 
			EventNames.FORCED_KILL, 
			this.onForcedKill, 
			false, 
			this
		);
	}
};

/**
*@private
*/
Level.prototype.setSceneObjects = function() {
	var arrSO,
		obj,
		so,
		enemy,
		SceneObjectClass;

	//Dynamically resolve the derived SceneObject class and create an instance of it
	for(var key in this.data.sceneObjects) {
		arrSO = this.data.sceneObjects[key];

		SceneObjectClass = SceneObjectClasses[key];

		for(var i = 0; i < arrSO.length; i++) {
			obj = arrSO[i];

			//TODO: This could be more elegant...
			if(obj.enemy) {
				enemy = this.arrEnemySystems[obj.enemy].getEnemy();
				so = new SceneObjectClass(obj.width, obj.height, obj.color, enemy);
			} else if(obj.numFloors) {
				so = new SceneObjectClass(obj.width, obj.height, obj.color, obj.numFloors);
			} else {
				so = new SceneObjectClass(obj.width, obj.height, obj.color);
			}

			so.setPosition(obj.x, obj.y);

			if(enemy) {
				app.layers.getStage(LayerTypes.FOREGROUND).addChild(enemy.container);
			}
			
			this.arrSceneObjects.push(so);
		}
	}
};

Level.prototype.setGraph = function() {
	app.pathFinder = new PathFinder(
		this.data.dimensions.width,
		this.data.dimensions.height,
		this.data.sceneObjects
	);
};

//EVENT HANDLERS
/**
*@private
*/
Level.prototype.onLevelComplete = function(e) {
	console.log("Level end...");
};

Level.prototype.onInitWarning = function(e) {
	//bubble the event from the WaveManager instance up
	goog.events.dispatchEvent(this, e);
};

Level.prototype.onInitSpawnParticle = function(e) {
	//bubble the event from the WaveManager instance up
	goog.events.dispatchEvent(this, e);
};

Level.prototype.onRemoveSpawnParticle = function(e) {
	//bubble the event from the current Wave isntance up
	goog.events.dispatchEvent(this, e);
};

Level.prototype.onForcedKill = function(e) {
	//bubble the event from the EnemySystem instance up
	goog.events.dispatchEvent(this, e);
};