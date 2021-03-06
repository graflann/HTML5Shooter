goog.provide('EnemyTank');

goog.require('Enemy');
goog.require('Navigation');
goog.require('EnemyDroneTurret');
goog.require('EnemyRoamingState');
goog.require('EnemySnipingState');
goog.require('EnemyStrafingState');
goog.require('RotationUtils');
goog.require('BoundsUtils');

/**
*@constructor
*/
EnemyTank = function(projectileSystem) {
	Enemy.call(this);

	/**
	 * @type {Array}
	 */
	this.projectileSystem = projectileSystem;

	this.categoryBits = CollisionCategories.GROUND_ENEMY;

	this.maskBits = CollisionCategories.PLAYER_PROJECTILE | CollisionCategories.PLAYER_BASE;

	this.shape = null;

	this.turret = null;

	this.turretOffsetY = 6;

	this.navigation = null;

	this.intendedRotation = 0;

	this.rotationRate = 5;

	this.baseRotationDeg = 0;

	this.stateMachine = null;

	this.init();
};

goog.inherits(EnemyTank, Enemy);

EnemyTank.HOMING_RATE = 15;

EnemyTank.MIN_STRAFE_TIME = 2000;
EnemyTank.MAX_STRAFE_TIME = 4000;

EnemyTank.MIN_ROAM_TIME = 500;
EnemyTank.MAX_ROAM_TIME = 5000;

EnemyTank.MIN_SNIPE_TIME = 2000;
EnemyTank.MAX_SNIPE_TIME = 4000;

/**
*@override
*@public
*/
EnemyTank.prototype.init = function() {
	var droneBaseSpriteSheet = app.assetsProxy.arrSpriteSheet["enemyDroneBase"];

	this.container = new createjs.Container();

	this.width = droneBaseSpriteSheet._frames[0].rect.width;
	this.height = droneBaseSpriteSheet._frames[0].rect.height;

	this.velocityMod = 1.5;

	this.shape = new createjs.BitmapAnimation(droneBaseSpriteSheet);
	this.shape.regX = this.width * 0.5;
	this.shape.regY = this.height * 0.5;
	this.shape.gotoAndStop(0);
	this.container.addChild(this.shape);

	this.turret = new EnemyDroneTurret(true, [ this.projectileSystem ]);
	this.turret.fireCounter = 0;
	this.turret.fireThreshold = 30;
	this.container.addChild(this.turret.shape);

	this.collisionRoutingObject = new CollisionRoutingObject();
	this.collisionRoutingObject.type = EnemyTypes.TANK;

	this.setPhysics();

	this.navigation = new Navigation();

	this.setStateMachine();

	this.setIsAlive(false);

	this.scoreValue = 200;
};

/**
*@override
*@public
*/
EnemyTank.prototype.update = function(options) {
	if(this.isAlive) {	
		this.stateMachine.update(options);

		BoundsUtils.checkBounds(this.position, this.container, options.camera);
	}
};

EnemyTank.prototype.updateBase = function(options) {
	var target = options.target,
			sin,
			cos,
			table = app.trigTable;

	//only calculates homing to target on selected frames
	if(target && createjs.Ticker.getTicks() % EnemyTank.HOMING_RATE === 0) {

		//out of the arena
		if(this.position.x < 0 || this.position.y < 0 ||
			this.position.x > app.arenaWidth || this.position.y > app.arenaHeight)
		{
			this.baseRotationDeg = Math.radToDeg(
				Math.atan2(
					target.position.y - this.position.y, 
					target.position.x - this.position.x
				)
			);
		}
		else //within the arena
		{
			this.navigation.update(this.position, target.position);

			this.baseRotationDeg = Math.radToDeg(
				Math.atan2(
					this.navigation.targetPosition.y - this.position.y, 
					this.navigation.targetPosition.x - this.position.x
				)
			);
		}

		this.velocity.x = (table.cos(this.baseRotationDeg) * this.velocityMod);
		this.velocity.y = (table.sin(this.baseRotationDeg) * this.velocityMod);
	}

	this.container.x += this.velocity.x;
	this.container.y += this.velocity.y;

	this.setPosition(this.container.x, this.container.y);

	RotationUtils.updateRotation(this, this.shape, 90);
};

/**
*@override
*@public
*/
EnemyTank.prototype.updateTurretToBase = function(options) {
	//ensure the turret faces the direction the tank is moving when roaming
	this.turret.baseRotationDeg = this.baseRotationDeg;
	//this.turret.updateRotation();
	RotationUtils.updateRotation(this.turret, this.turret.shape, 90);
};

/**
*@public
*/
EnemyTank.prototype.enterRoaming = function(options) {
	var self = this,
		maxIndex = EnemyRoamingState.NEXT_STATE_MAP.length - 1,
		randIndex = Math.randomInRangeWhole(0, maxIndex),
		randRoamTime = Math.randomInRangeWhole(
			EnemyTank.MIN_ROAM_TIME, 
			EnemyTank.MAX_ROAM_TIME
		);

	this.shape.play();

	this.clearTimer();

	this.timer = setTimeout(function() {
		self.stateMachine.setState(EnemyRoamingState.NEXT_STATE_MAP[randIndex]);
	}, randRoamTime);
};

/**
*@public
*/
EnemyTank.prototype.updateRoaming = function(options) {
	this.updateBase(options);
	this.updateTurretToBase(options);
};

/**
*@public
*/
EnemyTank.prototype.enterSniping = function(options) {
	var self = this,
		maxIndex = EnemySnipingState.NEXT_STATE_MAP.length - 1,
		randIndex = Math.randomInRangeWhole(0, maxIndex),
		randRoamTime = Math.randomInRangeWhole(
			EnemyTank.MIN_SNIPE_TIME, 
			EnemyTank.MAX_SNIPE_TIME
		);

	this.shape.gotoAndStop(0);
	this.turret.fireCounter = 0;
	this.turret.fireThreshold = 30;

	this.clearTimer();

	this.timer = setTimeout(function() {
		self.stateMachine.setState(EnemySnipingState.NEXT_STATE_MAP[randIndex]);
	}, randRoamTime);
};

/**
*@public
*/
EnemyTank.prototype.updateSniping = function(options) {
	this.turret.update({ target: options.target.position });
};

/**
*@public
*/
EnemyTank.prototype.enterStrafing = function(options) {
	var self = this;
	var maxIndex = EnemyStrafingState.NEXT_STATE_MAP.length - 1;
	var randIndex = Math.randomInRangeWhole(0, maxIndex);
	var randRoamTime = Math.randomInRangeWhole(
		EnemyTank.MIN_STRAFE_TIME, 
		EnemyTank.MAX_STRAFE_TIME
	);

	this.shape.play();
	this.turret.fireCounter = 0;
	this.turret.fireThreshold = 45;

	this.clearTimer();

	this.timer = setTimeout(function() {
		self.stateMachine.setState(EnemyStrafingState.NEXT_STATE_MAP[randIndex]);
	}, randRoamTime);
};

/**
*@public
*/
EnemyTank.prototype.updateStrafing = function(options) {
	this.updateBase(options);
	this.turret.update({ target: options.target.position });
};

/**
*@override
*@public
*/
EnemyTank.prototype.clear = function() {
	Enemy.prototype.clear.call(this);

	this.projectileSystem = null;

	this.shape = null;

	//this.turret.clear();
	this.turret = null;

	this.navigation.clear();
	this.navigation = null;

	this.stateMachine.clear();
	this.stateMachine = null;
};

/**
*@public
*/
EnemyTank.prototype.kill = function() {
	if(this.isAlive) {
		this.setIsAlive(false);

		this.stateMachine.reset();

		this.navigation.reset();

		this.container.getStage().removeChild(this.container);

		this.dispatchKillEvent();
	}
};

/**
*@override
*@public
*/
EnemyTank.prototype.setIsAlive = function(value) {
	Enemy.prototype.setIsAlive.call(this, value);

	if(this.isAlive) {
		this.health = 6;
		this.stateMachine.setState(EnemyRoamingState.KEY);
	} else {
		this.clearTimer();
		this.shape.gotoAndStop(0);
	} 
};

/**
*@private
*/
EnemyTank.prototype.setPosition = function(x, y) {
	this.position.x = this.container.x = x;
	this.position.y = this.container.y = y;

	this.physicalPosition.x = this.position.x / app.physicsScale;
	this.physicalPosition.y = this.position.y / app.physicsScale;
	
	this.body.SetPosition(this.physicalPosition);
};

EnemyTank.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef();
	
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
};

EnemyTank.prototype.setStateMachine = function() {
	this.stateMachine = new StateMachine();

	this.stateMachine.addState(
		EnemyRoamingState.KEY,
		new EnemyRoamingState(this),
		[ EnemySnipingState.KEY, EnemyStrafingState.KEY ]
	);

	this.stateMachine.addState(
		EnemySnipingState.KEY,
		new EnemySnipingState(this),
		[ EnemyRoamingState.KEY, EnemyStrafingState.KEY ]
	);

	this.stateMachine.addState(
		EnemyStrafingState.KEY,
		new EnemyStrafingState(this),
		[ EnemyRoamingState.KEY, EnemySnipingState.KEY ]
	);
	
	//this.stateMachine.setState(EnemyRoamingState.KEY);
};

goog.exportSymbol('EnemyTank', EnemyTank);