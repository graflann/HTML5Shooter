goog.provide('EnemyCarrier');

goog.require('Enemy');
goog.require('Rotor');
goog.require('HatchDoor');
goog.require('Platform');
goog.require('EnemyCopterShadow');
goog.require('EnemySnipingState');
goog.require('EnemySeekingState');
goog.require('RotationUtils');

/**
*@constructor
*/
EnemyCarrier = function(projectileSystem, enemySystem) {
	Enemy.call(this);

	/**
	 * @type {ProjectileSystem}
	 */
	this.projectileSystem = projectileSystem;

	/**
	*Requires a reference to an enemy system to spawn EnemyCopter instances
	**/
	this.enemySystem = enemySystem;

	this.categoryBits = CollisionCategories.AIR_ENEMY;

	this.maskBits = CollisionCategories.HOMING_PROJECTILE | CollisionCategories.HOMING_OVERLAY;

	this.shape = null;

	this.reticle = null;

	this.fireThreshold = 0;

	this.fireCounter = 0;

	this.minDistance = Math.pow(400, 2);

	this.shadow = null;

	this.stateMachine = null;

	this.intendedRotation = 0;

	this.rotationRate = 1;

	this.baseRotationDeg = 0;

	this.arrRotors = [];

	this.arrRotorBodies = [];

	this.arrRotorDistances = [];

	this.arrRotorAngleOffsets = [];

	this.arrDoors = [];

	this.currentDoorIndex = 0;

	this.arrPlatforms = [];

	this.spawnTimer = null;

	this.health = 10;

	this.init();
};

goog.inherits(EnemyCarrier, Enemy);

//CONSTANTS///////////////////////////////////////
EnemyCarrier.HOMING_RATE = 5;

EnemyCarrier.FIRE_OFFSETS = [-30, 30];

EnemyCarrier.AMMO_DISTANCE = 180 / app.physicsScale;

EnemyCarrier.ROTOR_RADIUS = 30;

EnemyCarrier.ROTOR_THICKNESS = 3;

EnemyCarrier.ROTOR_OFFSETS = [
	new app.b2Vec2(95, -107),
	new app.b2Vec2(-95, -107),
	new app.b2Vec2(177, 0),
	new app.b2Vec2(-177, 0),
	new app.b2Vec2(95, 107),
	new app.b2Vec2(-95, 107)
];

EnemyCarrier.SHADOW_OFFSET = new app.b2Vec2(128, 128);

EnemyCarrier.SHADOW_SCALE = 0.75;

EnemyCarrier.DOOR_DIMENSIONS = new app.b2Vec2(91, 109);

EnemyCarrier.DOOR_OFFSETS = [
	new app.b2Vec2(24, -54),
	new app.b2Vec2(-115, -54)
];

EnemyCarrier.DOOR_ALPHA = 0.75;

//Door / platform indices
EnemyCarrier.LEFT_DOOR 	= 0;
EnemyCarrier.RIGHT_DOOR = 1;

///////////////////////////////////////////////////

/**
*@override
*@public
*/
EnemyCarrier.prototype.init = function() {
	var carrierSpriteSheet = app.assetsProxy.arrSpriteSheet["enemyCarrier"];

	this.container = new createjs.Container();

	this.width = carrierSpriteSheet._frames[0].rect.width;
	this.height = carrierSpriteSheet._frames[0].rect.height;

	this.velocityMod = 1.5;

	this.fireThreshold = 120;

	this.shape = new createjs.BitmapAnimation(carrierSpriteSheet);
	this.shape.regX = this.width * 0.5;
	this.shape.regY = this.height * 0.5;
	this.container.addChild(this.shape);

	this.shape.gotoAndStop(0);

	this.setRotors();

	this.setDoors();

	this.setPlatforms();

	this.shadow = new EnemyCopterShadow(this, EnemyCarrier.SHADOW_OFFSET, EnemyCarrier.SHADOW_SCALE);

	this.setPhysics();

	this.setStateMachine();

	this.setIsAlive(false);
};

/**
*@override
*@public
*/
EnemyCarrier.prototype.update = function(options) {
	if(this.isAlive) {

		//update current state
		this.stateMachine.update(options);

		//rotors always rotate...
		this.updateRotors();

		//update rotation (yaw)
		RotationUtils.updateRotation(this, this.container, 90);

		//update the shadow
		this.shadow.update(options);

		//updates applicable homing reticle
		if(this.reticle) {
			this.reticle.shape.x = this.position.x;
			this.reticle.shape.y = this.position.y;
		}
	}
};

EnemyCarrier.prototype.updateRotors = function() {
	var i = -1,
		length = this.arrRotors.length;

	while(++i < length) {
		this.arrRotors[i].update();
	}
};

/**
*@override
*@public
*/
EnemyCarrier.prototype.clear = function() {
	var i = 0;

	Enemy.prototype.clear.call(this);

	this.projectileSystem = null;

	/**
	*Requires a reference to an enemy system to spawn EnemyCopter instances
	**/
	this.enemySystem = null;

	this.shape = null;

	this.reticle = null;

	this.shadow.clear();
	this.shadow = null;

	this.stateMachine.clear();
	this.stateMachine = null;

	for(i = 0; i < this.arrRotors.length; i++) {
		this.arrRotors[i].clear();
		this.arrRotors[i] = null;

		this.arrRotorBodies[i].DestroyFixture(this.arrRotorBodies[i].GetFixtureList());
		app.physicsWorld.DestroyBody(this.arrRotorBodies[i]);
		this.arrRotorBodies[i] = null;
	}
	this.arrRotors = null;
	this.arrRotorBodies = null;

	for(i = 0; i < this.arrDoors.length; i++) {
		this.arrDoors[i].clear();
		this.arrDoors[i] = null;
	}
	this.arrDoors = null;

	for(i = 0; i < this.arrPlatforms.length; i++) {
		this.arrPlatforms[i].clear();
		this.arrPlatforms[i] = null;
	}
	this.arrPlatforms = null;
};

/**
*@public
*/
EnemyCarrier.prototype.kill = function() {
	if(this.isAlive) {
		this.setIsAlive(false);

		this.container.getStage().removeChild(this.container);

		//remove the shadow too
		this.shadow.container.getStage().removeChild(this.shadow.container);

		this.dispatchKillEvent();
	}
};

/**
*@public
*/
EnemyCarrier.prototype.setIsAlive = function(value) {
	Enemy.prototype.setIsAlive.call(this, value);

	if(this.isAlive) {
		this.stateMachine.setState(EnemySeekingState.KEY);
	} else {
		this.clearTimer();
		this.clearSpawnTimer();
	}
};

EnemyCarrier.prototype.enterSeeking = function(options) {
	var self = this;

	this.clearSpawnTimer();

	this.spawnTimer = setTimeout(function() {
		self.spawnEnemy();
	}, 5000);
};

/**
*@public
*/
EnemyCarrier.prototype.updateSeeking = function(options) {
	var target = options.target,
		deg,
		sin,
		cos,
		distance,
		table = app.trigTable;

	//only calculates homing to target on selected frames
	if(target && createjs.Ticker.getTicks() % EnemyCarrier.HOMING_RATE == 0) {
		this.baseRotationDeg = Math.radToDeg(
			Math.atan2(
				target.position.y - this.position.y, 
				target.position.x - this.position.x
			)
		);

		this.velocity.x = (table.cos(this.baseRotationDeg) * this.velocityMod);
		this.velocity.y = (table.sin(this.baseRotationDeg) * this.velocityMod);

		distance = this.position.DistanceSqrd(target.position);

		if(distance < this.minDistance) {
			this.stateMachine.setState(EnemySnipingState.KEY);
		}
	}

	this.container.x += this.velocity.x;
	this.container.y += this.velocity.y;

	this.setPosition(this.container.x, this.container.y);
};

EnemyCarrier.prototype.enterSniping = function(options) {
	var self = this,
		randomInRange = Math.randomInRange(2000, 3500);

	this.clearTimer();

	this.timer = setTimeout(function() {
		self.stateMachine.setState(EnemySeekingState.KEY);
	}, randomInRange);
};

/**
 *Face player and fire in bursts
*@public
*/
EnemyCarrier.prototype.updateSniping = function(options) {
	var target = options.target,
		deg,
		sin,
		cos,
		table = app.trigTable;

	//only calculates facing target on selected frames
	if(target && createjs.Ticker.getTicks() % EnemyCopter.HOMING_RATE == 0) {
		this.baseRotationDeg = Math.radToDeg(
			Math.atan2(
				target.position.y - this.position.y, 
				target.position.x - this.position.x
			)
		);
	}

	//check fire
	this.updateFiring(options);
};

/**
 *Face player and fire in bursts
*@public
*/
EnemyCarrier.prototype.updateFiring = function(options) {
	var target = options.target,
		deg,
		sin,
		cos,
		table = app.trigTable;

	//only calculates facing target on selected frames
	if(target && createjs.Ticker.getTicks() % EnemyCarrier.HOMING_RATE == 0) {
		this.baseRotationDeg = Math.radToDeg(
			Math.atan2(
				target.position.y - this.position.y, 
				target.position.x - this.position.x
			)
		);
	}

	//check fire
	if(this.fireCounter++ > this.fireThreshold) {
		this.fire();
		this.fireCounter = 0;
	}
};

/**
*@public
*/
EnemyCarrier.prototype.fire = function() {
	var deg,
		sin,
		cos,
		firingPosDeg,
		firingPosSin,
		firingPosCos,
		vector2D = new app.b2Vec2(),
		trigTable = app.trigTable,
		stage = app.layers.getStage(LayerTypes.PROJECTILE),
		projectile = null,
		i = -1,
		length = EnemyCarrier.FIRE_OFFSETS.length;

	//acquire rotation of Copter instance in degrees and add ammo at table-referenced distance			
	deg = this.container.rotation - 90;
	sin = trigTable.sin(deg);
	cos = trigTable.cos(deg);

	//fires 2 parallel shots simultaneously
	while(++i < length) {
		projectile = this.projectileSystem.getProjectile();

		if(projectile) {			
			//zero out existing linear velocity
			projectile.body.SetLinearVelocity(app.vecZero);

			//acquire values to determine firing position
			firingPosDeg = (deg + EnemyCarrier.FIRE_OFFSETS[i]);
			firingPosSin = trigTable.sin(firingPosDeg);
			firingPosCos = trigTable.cos(firingPosDeg); 
			
			vector2D.x = (this.position.x / app.physicsScale) + (firingPosCos * EnemyCarrier.AMMO_DISTANCE);
			vector2D.y = (this.position.y / app.physicsScale) + (firingPosSin * EnemyCarrier.AMMO_DISTANCE);				
			projectile.body.SetPosition(vector2D);
			
			vector2D.x = cos * projectile.velocityMod;
			vector2D.y = sin * projectile.velocityMod;		
			projectile.body.ApplyForce(vector2D, projectile.body.GetWorldCenter());

			projectile.setIsAlive(true);
			
			projectile.shape.rotation = this.container.rotation;
			stage.addChild(projectile.shape);
		}
	}
};

EnemyCarrier.prototype.openDoor = function(index, callback) {
	this.arrDoors[index].open(callback);
};

EnemyCarrier.prototype.closeDoor = function(index, callback) {
	this.arrDoors[index].close(callback);
};

/**
*Sets forth a sequence of animations / activity to spawn an airborne enemy from a hatch door / platform
*/
EnemyCarrier.prototype.spawnEnemy = function() {
	var self = this,
		enemy = null,
		platform = this.arrPlatforms[this.currentDoorIndex],
		spawnOptions = { intervalQuantity: 1 };

	enemy = this.enemySystem.generate(spawnOptions)[0];

	if(enemy) {
		//grabs the next available enemy in the pool and adds it to the platform
		enemy.setIsAlive(false);
		enemy.container.rotation = 0;
		platform.container.addChild(enemy.container);

		//on opening an enemy is added to the air layer and becomes live
		//after the door has been opened for a set time,
		//the door closes and the platform moves down to its default position
		var onDoorOpened = function() {
			var trigTable = app.trigTable,
				deg = 0,
				sin = trigTable.sin(deg),
				cos = trigTable.cos(deg),
				spawnDistance = app.vecZero.Distance(platform.position);

			(self.currentDoorIndex == EnemyCarrier.LEFT_DOOR) ? deg = self.baseRotationDeg - 90 : deg = self.baseRotationDeg + 90;
			sin = trigTable.sin(deg);
			cos = trigTable.cos(deg);

			platform.container.removeChild(enemy.container);
			
			app.layers.getStage(LayerTypes.AIR).addChild(enemy.container);
			app.layers.getStage(LayerTypes.SHADOW).addChild(enemy.shadow.container);

			enemy.container.rotation = self.container.rotation;
			enemy.container.x = self.container.x + (cos * spawnDistance);
			enemy.container.y = self.container.y + (sin * spawnDistance);
			enemy.setIsAlive(true);

			//do not notify the wavemanager of this enemy's kill as it exists outside of the wave
			enemy.isWaveEnabled = false; 

			setTimeout(function() {
				self.closeDoor(self.currentDoorIndex);

				self.arrPlatforms[self.currentDoorIndex].moveDown();

				//update current door index; alternates between left and right
				self.currentDoorIndex++;

				if(self.currentDoorIndex > EnemyCarrier.RIGHT_DOOR) {
					self.currentDoorIndex = 0;
				}

				if(self.spawnTimer) {
					self.clearSpawnTimer();

					self.spawnTimer = setTimeout(function() {
						self.spawnEnemy();
					}, 5000);
				}


			}, 2000);
		};

		//upon the platform moving up into place the door opens
		var onMovedUp = function() {
			self.openDoor(self.currentDoorIndex, onDoorOpened);
		};

		this.arrPlatforms[this.currentDoorIndex].moveUp(onMovedUp);
	}
};

/**
*@private
*/
EnemyCarrier.prototype.setPosition = function(x, y) {
	var i = -1,
		length = this.arrRotorBodies.length,
		rotorBodyPosition = new app.b2Vec2(),
		rotorOffset = null,
		rotorDistance = 0,
		rotorAngleOffset = 0,
		table = app.trigTable;

	this.position.x = this.container.x = x;
	this.position.y = this.container.y = y;

	this.physicalPosition.x = this.position.x / app.physicsScale;
	this.physicalPosition.y = this.position.y / app.physicsScale;
	
	this.body.SetPosition(this.physicalPosition);

	while(++i < length) {
		rotorOffset = EnemyCarrier.ROTOR_OFFSETS[i];
		rotorAngleOffset = this.container.rotation + this.arrRotorAngleOffsets[i];
		rotorDistance = this.arrRotorDistances[i];

		rotorBodyPosition.x = this.physicalPosition.x + (rotorDistance * table.cos(rotorAngleOffset));
		rotorBodyPosition.y = this.physicalPosition.y + (rotorDistance * table.sin(rotorAngleOffset));

		this.arrRotorBodies[i].SetPosition(rotorBodyPosition);
	}	
};

EnemyCarrier.prototype.setRotors = function() {
	var rotor,
		offset;

	for(var i = 0; i < EnemyCarrier.ROTOR_OFFSETS.length; i++) {
		rotor = new Rotor(
			Constants.YELLOW, 
			EnemyCarrier.ROTOR_RADIUS,
			EnemyCarrier.ROTOR_THICKNESS
		);

		offset = EnemyCarrier.ROTOR_OFFSETS[i];

		rotor.container.x = offset.x;
		rotor.container.y = offset.y;

		this.container.addChild(rotor.container);

		this.arrRotors.push(rotor);
	}
};

EnemyCarrier.prototype.setDoors = function() {
	var door,
		offset,
		arrColors = [Constants.YELLOW, Constants.DARK_RED];

	//LEFT
	door = new HatchDoor(
		EnemyCarrier.DOOR_DIMENSIONS.x,
		EnemyCarrier.DOOR_DIMENSIONS.y,
		arrColors,
		EnemyCarrier.DOOR_ALPHA
	);

	offset = EnemyCarrier.DOOR_OFFSETS[EnemyCarrier.RIGHT_DOOR];

	//the doors appear to slide in opposite directions
	//so the left door is inverted via adjustments to the position and rotation
	door.shape.x = offset.x + door.width;
	door.shape.y = offset.y + door.height;
	door.shape.rotation = 180;

	this.container.addChild(door.shape);
	this.arrDoors.push(door);

	//RIGHT
	door = new HatchDoor(
		EnemyCarrier.DOOR_DIMENSIONS.x,
		EnemyCarrier.DOOR_DIMENSIONS.y,
		arrColors,
		EnemyCarrier.DOOR_ALPHA
	);

	offset = EnemyCarrier.DOOR_OFFSETS[EnemyCarrier.LEFT_DOOR];

	door.shape.x = offset.x;
	door.shape.y = offset.y;

	this.container.addChild(door.shape);
	this.arrDoors.push(door);
};

EnemyCarrier.prototype.setPlatforms = function() {
	var platform,
		offset,
		door = null,
		offset = new app.b2Vec2();

	for(var i = 0; i < EnemyCarrier.DOOR_OFFSETS.length; i++) {
		door = this.arrDoors[i];

		offset.x = Math.floor(door.width * 0.5);
		offset.y = Math.floor(door.height * 0.5);

		platform = new Platform(door.width, door.height, Constants.DARK_RED);

		if(i == EnemyCarrier.RIGHT_DOOR) {
			platform.container.x = door.shape.x + offset.x;
			platform.container.y = door.shape.y + offset.y;
		} else {
			platform.container.x = door.shape.x - offset.x;
			platform.container.y = door.shape.y - offset.y;
		}

		this.container.addChildAt(platform.container, this.container.getChildIndex(door.shape));
		this.arrPlatforms.push(platform);

		platform.setScale(Platform.MIN_SCALE);
		platform.position.x = platform.container.x;
		platform.position.y = platform.container.y;
	}
};

EnemyCarrier.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef(),
		rotorBody = null,
		rotorOffset = null,
		rotorAngleOffset = 0;
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = this.categoryBits;
	fixDef.filter.maskBits = this.maskBits;
	fixDef.isSensor = true;
	fixDef.shape = new app.b2CircleShape(1);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetAwake(true);

	//set the rotor bodies, b2_dynamicBody sensors, one for each rotor
	for(var i = 0; i < this.arrRotors.length; i++) {
		//set a fixture and body sensor per rotor for hto targeting
		fixDef.density = 1.0;
		fixDef.friction = 0;
		fixDef.restitution = 1.0;
		fixDef.filter.categoryBits = this.categoryBits;
		fixDef.filter.maskBits = this.maskBits;
		fixDef.isSensor = true;
		fixDef.shape = new app.b2CircleShape(1);
		
		bodyDef.type = app.b2Body.b2_dynamicBody;
		body = app.physicsWorld.CreateBody(bodyDef);
		body.CreateFixture(fixDef);
		body.SetUserData(this);
		body.SetAwake(true);
		this.arrRotorBodies.push(body);

		//cache the angle of each rotor sensor from the center body sensor
		rotorOffset = EnemyCarrier.ROTOR_OFFSETS[i];
		rotorAngleOffset = Math.radToDeg(Math.atan2(-rotorOffset.y, -rotorOffset.x));
		this.arrRotorAngleOffsets.push(rotorAngleOffset);

		//adjust rendered positon to physics position
		rotorOffset.x /= app.physicsScale;
		rotorOffset.y /= app.physicsScale;

		//cache the distances between each rotor sensor and the center body sensor
		this.arrRotorDistances.push(rotorOffset.Distance(this.physicalPosition));
	}
};

EnemyCarrier.prototype.setStateMachine = function() {
	this.stateMachine = new StateMachine();

	this.stateMachine.addState(
		EnemySeekingState.KEY,
		new EnemySeekingState(this),
		[ EnemySnipingState.KEY ]
	);

	this.stateMachine.addState(
		EnemySnipingState.KEY,
		new EnemySnipingState(this),
		[ EnemySeekingState.KEY ]
	);
};

EnemyCarrier.prototype.clearSpawnTimer = function () {
	if(this.spawnTimer) {
		clearTimeout(this.spawnTimer);
		this.spawnTimer = null;
	}
};

/**
*@public
*/
EnemyCarrier.prototype.onHoming = function(homingObject, options) {
	if(!this.reticle) {
		options.reticles.emit(1, {
			posX: this.container.x + this.offset,
			posY: this.container.y + this.offset
		});

		this.reticle = options.reticles.getLastAlive();
	}
};

/**
*@public
*/
EnemyCarrier.prototype.onCollide = function(collisionObject, options) {

	if(this.modifyHealth(collisionObject.damage) === 0) {
		options.explosions.emit(16, {
			posX: this.position.x,
			posY: this.position.y,
			posOffsetX: 16,
			posOffsetY: 16,
			velX: 6,
			velY: 6
		});
	}
};

goog.exportSymbol('EnemyCarrier', EnemyCarrier);