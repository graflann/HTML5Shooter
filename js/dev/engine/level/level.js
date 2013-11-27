goog.provide('Level');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
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
Level = function(options) {

	this.options = {
		dimensions: { 
			width: Constants.WIDTH * 4, 
			height: Constants.HEIGHT * 2
		},
		enemies: {
			enemyDrone: {
				max: 64,
				projectileSystem: "ground"
			},

			enemyTank: {
				max: 1,
				projectileSystem: "ground"
			},

			enemyCentipede: {
				max: 1,
				projectileSystem: "ground"
			},

			enemyTurret: {
				max: 21,
				projectileSystem: "air"
			},

			enemyCopter: {
				max: 4,
				projectileSystem: "air"
			}
		},
		waves : [
			// [
			// 	{ 
			// 		type: "enemyCentipede", intervalTime: 1, intervalQuantity: 1, targetQuantity: 1,
			// 		positionX: 240, positionY: 320
			// 	}
			// ],
			// [
			// 	{ 
			// 		type: "enemyCentipede", intervalTime: 1, intervalQuantity: 1, targetQuantity: 1,
			// 		positionX: 640, positionY: 640
			// 	}
			// ]
			[
				{ 
					type: "enemyDrone", intervalTime: 1000, intervalQuantity: 1, targetQuantity: 1,
					positionX: 0, positionY: 64, posOffsetX: 64, posOffsetY: 64
				}
			]//,
		// 	[
		// 		{ 
		// 			type: "enemyCopter", intervalTime: 1000, intervalQuantity: 1, targetQuantity: 1,
		// 			positionX: -240, positionY: 64
		// 		},
		// 		{ 
		// 			type: "enemyCopter", intervalTime: 1000, intervalQuantity: 1, targetQuantity: 1,
		// 			positionX: -240, positionY: 416
		// 		},
		// 		{ 
		// 			type: "enemyCopter", intervalTime: 1000, intervalQuantity: 1, targetQuantity: 1,
		// 			positionX: 64, positionY: -240
		// 		},
		// 		{ 
		// 			type: "enemyCopter", intervalTime: 1000, intervalQuantity: 1, targetQuantity: 1,
		// 			positionX: 360, positionY: -240
		// 		}
		// 	],
		// 	[
		// 		{ 
		// 			type: "enemyDrone", intervalTime: 1000, intervalQuantity: 1, targetQuantity: 8,
		// 			positionX: 64, positionY: -240, posOffsetX: 64, posOffsetY: 64
		// 		},
		// 		{ 
		// 			type: "enemyDrone", intervalTime: 1000, intervalQuantity: 1, targetQuantity: 8,
		// 			positionX: 360, positionY: -240, posOffsetX: 64, posOffsetY: 64
		// 		},
		// 		{ 
		// 			type: "enemyCopter", intervalTime: 1000, intervalQuantity: 1, targetQuantity: 1,
		// 			positionX: 720, positionY: 1600
		// 		},
		// 		{ 
		// 			type: "enemyCopter", intervalTime: 1000, intervalQuantity: 1, targetQuantity: 1,
		// 			positionX: 1080, positionY: 1600
		// 		},
		// 	]
		],
		sceneObjects: {
			//wall: [
				// { 	
				// 	width: Constants.UNIT * 4 + 16,
				// 	height: Constants.UNIT * 4 + 16,
				// 	color: Constants.BLUE,
				// 	numFloors: 7,
				// 	x: 248, 
				// 	y: 208
				// },
				// { 	
				// 	width: Constants.UNIT,
				// 	height: Constants.UNIT * 4,
				// 	color: Constants.BLUE,
				// 	numFloors: 4,
				// 	x: 512, 
				// 	y: 128
				// }
			//],
			tower: [
				{ 	
					width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 0.5 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 0.5  - (Constants.UNIT * 0.5)
				},
				{ 	
					width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 0.5  - (Constants.UNIT * 0.5)
				},
				{ 
					width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 1.5 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 0.5  - (Constants.UNIT * 0.5)
				},
				{ 
					width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 2 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 0.5  - (Constants.UNIT * 0.5) 
				},
				{ 	
					width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 2.5 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 0.5  - (Constants.UNIT * 0.5)
				},
				{ 
					width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 3 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 0.5  - (Constants.UNIT * 0.5) 
				},
				{ 
					width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 3.5 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 0.5  - (Constants.UNIT * 0.5) 
				},
				{ 
					width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 0.5 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT - (Constants.UNIT * 0.5) 
				},
				{ 
					width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT - (Constants.UNIT * 0.5)  
				},
				{ 
					width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 1.5 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT - (Constants.UNIT * 0.5)
				},
				{ 
					width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 2 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT - (Constants.UNIT * 0.5) 
				},
				{ 
					width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 2.5 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT - (Constants.UNIT * 0.5)
				},
				{ 
					width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 3 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT - (Constants.UNIT * 0.5) 
				},
				{ width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 3.5 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT - (Constants.UNIT * 0.5) 
				},


				{ 
					width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 0.5 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 1.5 - (Constants.UNIT * 0.5) 
				},
				{ 
					width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 1.5 - (Constants.UNIT * 0.5)  
				},
				{ 
					width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 1.5 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 1.5 - (Constants.UNIT * 0.5)
				},
				{ 
					width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 2 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 1.5 - (Constants.UNIT * 0.5) 
				},
				{ 
					width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 2.5- (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 1.5 - (Constants.UNIT * 0.5)  
				},
				{ 
					width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 3 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 1.5 - (Constants.UNIT * 0.5)
				},
				{ 
					width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 3.5 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 1.5 - (Constants.UNIT * 0.5) 
				}
			]
		}
	};

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
		this.options.waves, 
		this.arrEnemySystems
	);

	goog.events.listen(
		this.waveManager, 
		EventNames.LEVEL_COMPLETE, 
		this.onLevelComplete, 
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
	
};

Level.prototype.removeReticles = function() {
	this.arrEnemySystems[EnemyTypes.TURRET].removeReticles();
	this.arrEnemySystems[EnemyTypes.COPTER].removeReticles();
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
};

/**
*@private
*/
Level.prototype.setEnemies = function() {
	var rawEnemy;

	for(var key in this.options.enemies) {
		rawEnemy = this.options.enemies[key];

		this.arrEnemySystems[key] = new EnemySystem(
			key, 
			rawEnemy.max, 
			this.arrEnemyProjectileSystems[rawEnemy.projectileSystem] 
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
	for(var key in this.options.sceneObjects) {
		arrSO = this.options.sceneObjects[key];

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
		this.options.dimensions.width,
		this.options.dimensions.height,
		this.options.sceneObjects
	);
};

//EVENT HANDLERS
/**
*@private
*/
Level.prototype.onLevelComplete = function(e) {
	console.log("Level end...");
};