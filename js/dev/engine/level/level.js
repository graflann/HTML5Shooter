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
		nodes: [
			{ positionX: 0, positionY: 0}
		],
		enemies: {
			enemyDrone: {
				max: 64,
				projectileSystem: "vulcan"
			},

			enemyTank: {
				max: 1,
				projectileSystem: "vulcan"
			},

			enemyTurret: {
				max: 21,
				projectileSystem: "vulcan"
			},

			enemyCopter: {
				max: 1,
				projectileSystem: "vulcan"
			}
		},
		waves : [
			[
				// { 
				// 	type: "enemyDrone", intervalTime: 0, intervalQuantity: 1, targetQuantity: 1
				// },
				// { 
				// 	type: "enemyDrone", intervalTime: 0, intervalQuantity: 1, targetQuantity: 1
				// },
				{ 
					type: "enemyCopter", intervalTime: 0, intervalQuantity: 1, targetQuantity: 1,
					positionX: 360, positionY: 100
				}
			]/*,
			[
				{ type: "enemyDrone", intervalTime: 2000, intervalQuantity: 1, 
					targetQuantity: 1, posOffsetX: 64, posOffsetY: 64 },
				{ type: "enemyDrone", intervalTime: 2000, intervalQuantity: 2, 
					targetQuantity: 16, posOffsetX: 64, posOffsetY: 64 }
			],
			[
				{ type: "enemyDrone", intervalTime: 2000, intervalQuantity: 3, 
					targetQuantity: 16, posOffsetX: 64, posOffsetY: 64 },
				{ type: "enemyDrone", intervalTime: 2000, intervalQuantity: 4, 
					targetQuantity: 28, posOffsetX: 64, posOffsetY: 64 }
			]*/
		],
		sceneObjects: {
			tower: [
				{ width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 0.5 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 0.5  - (Constants.UNIT * 0.5)
				},
				{ width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 0.5  - (Constants.UNIT * 0.5)
				},
				{ width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 1.5 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 0.5  - (Constants.UNIT * 0.5)
				},
				{ width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 2 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 0.5  - (Constants.UNIT * 0.5) 
				},
				{ width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 2.5 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 0.5  - (Constants.UNIT * 0.5)
				},
				{ width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 3 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 0.5  - (Constants.UNIT * 0.5) 
				},
				{ width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 3.5 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 0.5  - (Constants.UNIT * 0.5) 
				},

				{ width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 0.5 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT - (Constants.UNIT * 0.5) 
				},
				{ width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT - (Constants.UNIT * 0.5)  
				},
				{ width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 1.5 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT - (Constants.UNIT * 0.5)
				},
				{ width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 2 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT - (Constants.UNIT * 0.5) 
				},
				{ width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 2.5 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT - (Constants.UNIT * 0.5)
				},
				{ width: Constants.UNIT,
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


				{ width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 0.5 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 1.5 - (Constants.UNIT * 0.5) 
				},
				{ width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 1.5 - (Constants.UNIT * 0.5)  
				},
				{ width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 1.5 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 1.5 - (Constants.UNIT * 0.5)
				},
				{ width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 2 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 1.5 - (Constants.UNIT * 0.5) 
				},
				{ width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 2.5- (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 1.5 - (Constants.UNIT * 0.5)  
				},
				{ width: Constants.UNIT,
					height: Constants.UNIT,
					color: Constants.BLUE,
					enemy: "enemyTurret", 
					x: Constants.WIDTH * 3 - (Constants.UNIT * 0.5), 
					y: Constants.HEIGHT * 1.5 - (Constants.UNIT * 0.5)
				},
				{ width: Constants.UNIT,
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

	this.pathFinder = null;

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
	this.arrEnemyProjectileSystems[ProjectileTypes.VULCAN] = new ProjectileSystem(
		ProjectileTypes.VULCAN, 
		[Constants.YELLOW, Constants.RED],
		32,
		CollisionCategories.GROUND_ENEMY_PROJECTILE | CollisionCategories.AIR_ENEMY_PROJECTILE,
		CollisionCategories.PLAYER
	);

	this.arrEnemyProjectileSystems[ProjectileTypes.VULCAN].setVelocityMod(32);
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

	for(var key in this.options.sceneObjects) {
		arrSO = this.options.sceneObjects[key];

		SceneObjectClass = SceneObjectClasses[key];

		for(var i = 0; i < arrSO.length; i++) {
			obj = arrSO[i];

			if(obj.enemy) {
				enemy = this.arrEnemySystems[obj.enemy].getEnemy();

				so = new SceneObjectClass(obj.width, obj.height, obj.color, enemy);
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
	this.pathFinder = new PathFinder();
};

//EVENT HANDLERS
/**
*@private
*/
Level.prototype.onLevelComplete = function(e) {
	console.log("Level end...");
};