goog.provide('EnemyCopter');

goog.require('Enemy');
goog.require('Rotor');
goog.require('EnemyCopterShadow');
goog.require('EnemyCopterFiringState');
goog.require('EnemyCopterSeekingState');
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

	this.arrRotors = new Array(2);

	this.homingRate = 5;

	this.reticle = null;

	this.fireThreshold = 0;

	this.fireCounter = 0;

	this.minDistance = Math.pow(160, 2);

	this.shadow = null;

	this.stateMachine = null;

	this.intendedRotation = 0;

	this.rotationRate = 5;

	this.baseRotationDeg = 0;

	this.init();
};

goog.inherits(EnemyCopter, Enemy);

EnemyCopter.FIRE_OFFSETS = [-10, 10];

EnemyCopter.AMMO_DISTANCE = 60 / app.physicsScale;

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

	this.shadow = new EnemyCopterShadow(this);

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
		var target = options.target,
			i = -1;

		//update current state
		this.stateMachine.update(options);

		//rotors always rotate...
		while(++i < this.arrRotors.length) {
			this.arrRotors[i].update();
		}

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

/**
*@override
*@public
*/
EnemyCopter.prototype.clear = function() {
	
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

		goog.events.dispatchEvent(this, this.enemyKilledEvent);
	}
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
	if(target && createjs.Ticker.getTicks() % this.homingRate == 0) {
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
EnemyCopter.prototype.updateFiring = function(options) {
	var target = options.target,
		deg,
		sin,
		cos,
		table = app.trigTable;

	//only calculates facing target on selected frames
	if(target && createjs.Ticker.getTicks() % this.homingRate == 0) {
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
	for(var i = 0; i < this.arrRotors.length; i++) {
		this.arrRotors[i] = new Rotor(Constants.YELLOW, 16);
		this.container.addChild(this.arrRotors[i].shape);
	}

	this.arrRotors[0].shape.x = this.shape.regX - 22;
	this.arrRotors[1].shape.x = this.shape.regX - 66;
	this.arrRotors[0].shape.y = this.arrRotors[1].shape.y = this.shape.regY - 51;
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