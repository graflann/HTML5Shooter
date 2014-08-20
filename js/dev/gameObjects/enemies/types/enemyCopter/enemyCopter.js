goog.provide('EnemyCopter');

goog.require('Enemy');
goog.require('Rotor');
goog.require('EnemyCopterShadow');
goog.require('EnemySnipingState');
goog.require('EnemySeekingState');
goog.require('EnemyStrafingState');
goog.require('RotationUtils');

/**
*@constructor
*/
EnemyCopter = function(projectileSystem) {
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

	this.minSeekDistance = Math.pow(160, 2);

	this.minStrafeDistance = Math.pow(9, 2);

	this.shadow = null;

	this.stateMachine = null;

	this.strafeMovingPosition = new app.b2Vec2();

	this.strafeDistance = 0;

	this.strafeAngleOffset = 0;

	this.intendedRotation = 0;

	this.rotationRate = 5;

	this.baseRotationDeg = 0;

	this.init();
};

goog.inherits(EnemyCopter, Enemy);

EnemyCopter.HOMING_RATE = 5;

EnemyCopter.FIRE_OFFSETS = [-10, 10];

EnemyCopter.AMMO_DISTANCE = 60 / Constants.PHYSICS_SCALE;

EnemyCopter.ROTOR_RADIUS = 16;

EnemyCopter.ROTOR_OFFSETS = [
	new Box2D.Common.Math.b2Vec2(22, 51),
	new Box2D.Common.Math.b2Vec2(66, 51)
];

EnemyCopter.SHADOW_OFFSET = new Box2D.Common.Math.b2Vec2(48, 48);

EnemyCopter.SHADOW_SCALE = 0.6;

EnemyCopter.MIN_STAFE_DISTANCE = 200;
EnemyCopter.MAX_STAFE_DISTANCE = 350;

/**
*@override
*@public
*/
EnemyCopter.prototype.init = function() {
	var copterSpriteSheet = app.assetsProxy.arrSpriteSheet["copter"];

	this.container = new createjs.Container();

	this.width = copterSpriteSheet._frames[0].rect.width;
	this.height = copterSpriteSheet._frames[0].rect.height;

	this.velocityMod = 3;

	this.fireThreshold = 30;

	this.shape = new createjs.BitmapAnimation(copterSpriteSheet);
	this.shape.regX = 44;
	this.shape.regY = 53;
	this.container.addChild(this.shape);

	this.shape.gotoAndStop(0);

	this.setRotors();

	this.shadow = new EnemyCopterShadow(this, EnemyCopter.SHADOW_OFFSET, EnemyCopter.SHADOW_SCALE);

	this.collisionRoutingObject = new CollisionRoutingObject();
	this.collisionRoutingObject.type = EnemyTypes.COPTER;

	this.setPhysics();

	this.setStateMachine();

	this.setIsAlive(false);
};

/**
*@override
*@public
*/
EnemyCopter.prototype.update = function(options) {
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

EnemyCopter.prototype.updateRotors = function() {
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
EnemyCopter.prototype.clear = function() {
	Enemy.prototype.clear.call(this);

	this.projectileSystem = null;

	this.shape = null;

	for(var i = 0; i < this.arrRotors.length; i++) {
		this.arrRotors[i].clear();
		this.arrRotors[i] = null;
	}
	this.arrRotors = null;

	this.reticle = null;

	this.shadow.clear();
	this.shadow = null;

	this.stateMachine.clear();
	this.stateMachine = null;
};

/**
*@public
*/
EnemyCopter.prototype.setIsAlive = function(value) {
	Enemy.prototype.setIsAlive.call(this, value);

	if(this.isAlive) {
		this.health = 2;
		this.stateMachine.setState(EnemySeekingState.KEY);
	} else {
		this.clearTimer();
	}
};

/**
*@public
*/
EnemyCopter.prototype.kill = function() {
	if(this.isAlive) {
		this.setIsAlive(false);

		this.container.getStage().removeChild(this.container);

		//remove the shadow too
		this.shadow.container.getStage().removeChild(this.shadow.container);

		this.dispatchKillEvent();
	}
};

EnemyCopter.prototype.enterSeeking = function(options) {
	this.velocityMod = 3;
};

/**
*@public
*/
EnemyCopter.prototype.updateSeeking = function(options) {
	var target = options.target,
		deg,
		sin,
		cos,
		distance,
		table = app.trigTable;

	//only calculates homing to target on selected frames
	if(target && createjs.Ticker.getTicks() % EnemyCopter.HOMING_RATE == 0) {
		this.baseRotationDeg = Math.radToDeg(
			Math.atan2(
				target.position.y - this.position.y, 
				target.position.x - this.position.x
			)
		);

		this.velocity.x = (table.cos(this.baseRotationDeg) * this.velocityMod);
		this.velocity.y = (table.sin(this.baseRotationDeg) * this.velocityMod);

		distance = this.position.DistanceSqrd(target.position);

		if(distance < this.minSeekDistance) {
			this.stateMachine.setState(EnemySnipingState.KEY);
		}
	}

	this.container.x += this.velocity.x;
	this.container.y += this.velocity.y;

	this.setPosition(this.container.x, this.container.y);
};

EnemyCopter.prototype.enterSniping = function(options) {
	var self = this,
		randomInRange = Math.randomInRange(2000, 3500);

	this.clearTimer();

	this.timer = setTimeout(function() {
		self.stateMachine.setState(EnemyStrafingState.KEY);
	}, randomInRange);
};

/**
 *Face player and fire in bursts
*@public
*/
EnemyCopter.prototype.updateSniping = function(options) {
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
	this.updateFire();
};

EnemyCopter.prototype.enterStrafing = function(options) {
	var rand = Math.random();

	this.velocityMod = 6;

	this.strafeDistance = Math.randomInRange(
		EnemyCopter.MIN_STAFE_DISTANCE, 
		EnemyCopter.MAX_STAFE_DISTANCE
	);

	if(rand < 0.5) {
		this.strafeAngleOffset = Math.randomInRangeWhole(-90, -45);
	} else {
		this.strafeAngleOffset = Math.randomInRangeWhole(45, 90);
	}

};

/**
 *Faces player, moves in a direction, and fire in bursts
*@public
*/
EnemyCopter.prototype.updateStrafing = function(options) {
	var target = options.target,
		deg,
		sin,
		cos,
		table = app.trigTable,
		distance,
		targetRotation;

	//rotate the main container to face the target
	this.container.rotation = (Math.radToDeg(
		Math.atan2(
			target.position.y - this.position.y, 
			target.position.x - this.position.x
		)
	)) + 90;

	//only calculates homing to target on selected frames
	if(target && createjs.Ticker.getTicks() % EnemyCopter.HOMING_RATE == 0) {

		//determine a point to strafe to based on the target's rotation and a provide strafe offset
		targetRotation = target.baseContainer.rotation + this.strafeAngleOffset;

		cos = table.cos(targetRotation);
		sin = table.sin(targetRotation);

		this.strafeMovingPosition.x = (cos * this.strafeDistance) + target.position.x;
		this.strafeMovingPosition.y = (sin * this.strafeDistance) + target.position.y;

		this.baseRotationDeg = Math.radToDeg(
			Math.atan2(
				this.strafeMovingPosition.y - this.position.y, 
				this.strafeMovingPosition.x - this.position.x
			)
		);

		this.velocity.x = (table.cos(this.baseRotationDeg) * this.velocityMod);
		this.velocity.y = (table.sin(this.baseRotationDeg) * this.velocityMod);

		distance = this.position.DistanceSqrd(this.strafeMovingPosition);

		if(distance < this.minStrafeDistance) {
			this.stateMachine.setState(EnemySeekingState.KEY);
		}
	}

	this.container.x += this.velocity.x;
	this.container.y += this.velocity.y;

	this.setPosition(this.container.x, this.container.y);

	//check fire
	this.updateFire();
};

/**
*@private
*/
EnemyCopter.prototype.updateFire = function(options) {
	//check fire
	if(this.fireCounter++ > this.fireThreshold) {
		this.fire();
		this.fireCounter = 0;
	}
};

/**
*@public
*/
EnemyCopter.prototype.fire = function() {
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
		length = EnemyCopter.FIRE_OFFSETS.length;

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
			firingPosDeg = (deg + EnemyCopter.FIRE_OFFSETS[i]);
			firingPosSin = trigTable.sin(firingPosDeg);
			firingPosCos = trigTable.cos(firingPosDeg); 
			
			vector2D.x = (this.position.x / app.physicsScale) + (firingPosCos * EnemyCopter.AMMO_DISTANCE);
			vector2D.y = (this.position.y / app.physicsScale) + (firingPosSin * EnemyCopter.AMMO_DISTANCE);				
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

/**
*@private
*/
EnemyCopter.prototype.setPosition = function(x, y) {
	this.position.x = this.container.x = x;
	this.position.y = this.container.y = y;

	this.physicalPosition.x = this.position.x / app.physicsScale;
	this.physicalPosition.y = this.position.y / app.physicsScale;
	
	this.body.SetPosition(this.physicalPosition);
};

EnemyCopter.prototype.setRotors = function() {
	var rotor,
		offset;

	for(var i = 0; i < EnemyCopter.ROTOR_OFFSETS.length; i++) {
		rotor = new Rotor(Constants.DARK_PINK, EnemyCopter.ROTOR_RADIUS);
		offset = EnemyCopter.ROTOR_OFFSETS[i];

		rotor.container.x = this.shape.regX - offset.x;
		rotor.container.y = this.shape.regY - offset.y;

		this.container.addChild(rotor.container);

		this.arrRotors.push(rotor);
	}
};

EnemyCopter.prototype.setPhysics = function() {
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

EnemyCopter.prototype.setStateMachine = function() {
	this.stateMachine = new StateMachine();

	this.stateMachine.addState(
		EnemySeekingState.KEY,
		new EnemySeekingState(this),
		[ EnemySnipingState.KEY, EnemyStrafingState.KEY ]
	);

	this.stateMachine.addState(
		EnemySnipingState.KEY,
		new EnemySnipingState(this),
		[ EnemySeekingState.KEY, EnemyStrafingState.KEY ]
	);

	this.stateMachine.addState(
		EnemyStrafingState.KEY,
		new EnemyStrafingState(this),
		[ EnemySeekingState.KEY, EnemySnipingState.KEY ]
	);
	
	//this.stateMachine.setState(EnemySeekingState.KEY);
};

/**
*@public
*/
EnemyCopter.prototype.onHoming = function(homingObject, options) {
	if(!this.reticle) {
		options.reticles.emit(1, {
			posX: this.container.x + this.offset,
			posY: this.container.y + this.offset
		});

		this.reticle = options.reticles.getLastAlive();
	}
};

goog.exportSymbol('EnemyCopter', EnemyCopter);