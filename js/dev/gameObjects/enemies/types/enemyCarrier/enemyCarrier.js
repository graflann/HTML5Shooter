goog.provide('EnemyCarrier');

goog.require('Enemy');
goog.require('Rotor');
goog.require('HatchDoor');
goog.require('EnemyCopterShadow');
goog.require('EnemyCopterFiringState');
goog.require('EnemyCopterSeekingState');
goog.require('RotationUtils');

/**
*@constructor
*/
EnemyCarrier = function(projectileSystem) {
	Enemy.call(this);

	/**
	 * @type {ProjectileSystem}
	 */
	this.projectileSystem = projectileSystem;

	this.categoryBits = CollisionCategories.AIR_ENEMY;

	this.maskBits = CollisionCategories.HOMING_PROJECTILE | CollisionCategories.HOMING_OVERLAY;

	this.shape = null;

	this.arrRotors = [];

	this.reticle = null;

	this.fireThreshold = 0;

	this.fireCounter = 0;

	this.minDistance = Math.pow(160, 2);

	this.shadow = null;

	this.stateMachine = null;

	this.intendedRotation = 0;

	this.rotationRate = 1;

	this.baseRotationDeg = 0;

	this.arrDoors = [];

	this.init();
};

goog.inherits(EnemyCarrier, Enemy);

//CONSTANTS///////////////////////////////////////
EnemyCarrier.HOMING_RATE = 5;

EnemyCarrier.FIRE_OFFSETS = [-10, 10];

EnemyCarrier.AMMO_DISTANCE = 60 / app.physicsScale;

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

	this.fireThreshold = 30;

	this.shape = new createjs.BitmapAnimation(carrierSpriteSheet);
	this.shape.regX = this.width * 0.5;
	this.shape.regY = this.height * 0.5;
	this.container.addChild(this.shape);

	this.shape.gotoAndStop(0);

	this.setRotors();

	this.setDoors();

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

		goog.events.dispatchEvent(this, this.enemyKilledEvent);
	}
};

EnemyCarrier.prototype.enterSeeking = function(options) {
	self = this;

	setTimeout(function() {
		self.openDoor(EnemyCarrier.LEFT_DOOR);
		self.openDoor(EnemyCarrier.RIGHT_DOOR);
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
			this.stateMachine.setState(EnemyCopterFiringState.KEY);
		}
	}

	this.container.x += this.velocity.x;
	this.container.y += this.velocity.y;

	this.setPosition(this.container.x, this.container.y);
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

EnemyCarrier.prototype.openDoor = function(index) {
	var self  = this;

	this.arrDoors[index].open();

	setTimeout(function() {
		self.closeDoor(index);
	}, 2000);
};

EnemyCarrier.prototype.closeDoor = function(index) {
	this.arrDoors[index].close();
};

/**
*@private
*/
EnemyCarrier.prototype.setPosition = function(x, y) {
	this.position.x = this.container.x = x;
	this.position.y = this.container.y = y;

	this.physicalPosition.x = this.position.x / app.physicsScale;
	this.physicalPosition.y = this.position.y / app.physicsScale;
	
	this.body.SetPosition(this.physicalPosition);
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
		offset;

	//LEFT
	door = new HatchDoor(
		EnemyCarrier.DOOR_DIMENSIONS.x,
		EnemyCarrier.DOOR_DIMENSIONS.y,
		[ Constants.YELLOW, Constants.DARK_RED ], //invert the left door gradient to get them to line up when adjusted
		EnemyCarrier.DOOR_ALPHA
	);

	offset = EnemyCarrier.DOOR_OFFSETS[EnemyCarrier.RIGHT_DOOR];

	//the doors appear to slide in opposite directions
	//so the right door is inverted via adjustments to the position and rotation
	door.shape.x = offset.x + door.width;
	door.shape.y = offset.y + door.height;
	door.shape.rotation = 180;

	this.container.addChild(door.shape);
	this.arrDoors.push(door);

	//RIGHT
	door = new HatchDoor(
		EnemyCarrier.DOOR_DIMENSIONS.x,
		EnemyCarrier.DOOR_DIMENSIONS.y,
		[ Constants.YELLOW, Constants.DARK_RED ], //default gradient
		EnemyCarrier.DOOR_ALPHA
	);

	offset = EnemyCarrier.DOOR_OFFSETS[EnemyCarrier.LEFT_DOOR];

	door.shape.x = offset.x;
	door.shape.y = offset.y;

	this.container.addChild(door.shape);
	this.arrDoors.push(door);
};

EnemyCarrier.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef();
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = this.categoryBits;
	fixDef.filter.maskBits = this.maskBits;
	fixDef.isSensor = true;
	fixDef.shape = new app.b2CircleShape(1.75);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetAwake(true);
};

EnemyCarrier.prototype.setStateMachine = function() {
	this.stateMachine = new StateMachine();

	this.stateMachine.addState(
		EnemyCopterSeekingState.KEY,
		new EnemyCopterSeekingState(this),
		[ EnemyCopterFiringState.KEY ]
	);

	this.stateMachine.addState(
		EnemyCopterFiringState.KEY,
		new EnemyCopterFiringState(this),
		[ EnemyCopterSeekingState.KEY ]
	);
	
	this.stateMachine.setState(EnemyCopterSeekingState.KEY);
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

goog.exportSymbol('EnemyCarrier', EnemyCarrier);