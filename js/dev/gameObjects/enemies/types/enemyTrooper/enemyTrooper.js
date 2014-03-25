goog.provide('EnemyTrooper');

goog.require('Enemy');
goog.require('Navigation');
goog.require('EnemyRoamingState');
goog.require('EnemySnipingState');
goog.require('EnemyStrafingState');
goog.require('RotationUtils');

EnemyTrooper = function(projectileSystem) {
	Enemy.call(this);

	/**
	 * @type {Array}
	 */
	this.projectileSystem = projectileSystem;

	this.categoryBits = CollisionCategories.GROUND_ENEMY;

	this.maskBits = CollisionCategories.PLAYER_PROJECTILE | CollisionCategories.PLAYER_BASE;

	this.shape = null;

	this.navigation = null;

	this.health = 1;

	this.fireThreshold = 0;

	this.fireCounter = 0;

	this.intendedRotation = 0;

	this.rotationRate = 15;

	this.baseRotationDeg = 0;

	this.degToTarget = 0;

	this.stateMachine = null;

	this.walkAnimUtil = null;

	this.init();
};

goog.inherits(EnemyTrooper, Enemy);

EnemyTrooper.HOMING_RATE = 15;

EnemyTrooper.AMMO_DISTANCE = 16 / app.physicsScale;

EnemyTrooper.FIRE_OFFSET = -20;

EnemyTrooper.MIN_STRAFE_TIME = 2000;
EnemyTrooper.MAX_STRAFE_TIME = 4000;

EnemyTrooper.MIN_ROAM_TIME = 4000;
EnemyTrooper.MAX_ROAM_TIME = 6000;

EnemyTrooper.MIN_SNIPE_TIME = 2000;
EnemyTrooper.MAX_SNIPE_TIME = 4000;

/**
*@override
*@public
*/
EnemyTrooper.prototype.init = function() {
	var trooperSpriteSheet = app.assetsProxy.arrSpriteSheet["enemyTrooper"];

	this.container = new createjs.Container();

	this.width = trooperSpriteSheet._frames[0].rect.width;
	this.height = trooperSpriteSheet._frames[0].rect.height;

	this.velocityMod = 0.75;

	this.shape = new createjs.BitmapAnimation(trooperSpriteSheet);
	//this.shape.gotoAndStop(0);
	//this.shape.cache(0, 0, this.width, this.height);
	this.shape.regX = this.width * 0.5;
	this.shape.regY = this.height * 0.5;
	this.container.addChild(this.shape);

	this.walkAnimUtil = new AnimationUtility("walk", this.shape, 4);

	this.setPhysics();

	this.navigation = new Navigation();

	this.setStateMachine();

	this.setIsAlive(false);
};

/**
*@override
*@public
*/
EnemyTrooper.prototype.update = function(options) {
	if(this.isAlive) {	
		this.stateMachine.update(options);
	}
};

/**
*@public
*/
EnemyTrooper.prototype.enterRoaming = function(options) {
	var self = this,
		maxIndex = EnemyRoamingState.NEXT_STATE_MAP.length - 1,
		randIndex = Math.randomInRangeWhole(0, maxIndex),
		randRoamTime = Math.randomInRangeWhole(
			EnemyTrooper.MIN_ROAM_TIME, 
			EnemyTrooper.MAX_ROAM_TIME
		);

	this.walkAnimUtil.play();
	this.walkAnimUtil.loop(true);

	this.clearTimer();

	this.timer = setTimeout(function() {
		self.stateMachine.setState(EnemyRoamingState.NEXT_STATE_MAP[randIndex]);
	}, randRoamTime);
};

/**
*@public
*/
EnemyTrooper.prototype.updateRoaming = function(options) {
	var target = options.target,
			sin,
			cos,
			table = app.trigTable;

	//only calculates homing to target on selected frames
	if(target && createjs.Ticker.getTicks() % EnemyTrooper.HOMING_RATE === 0) {

		//out of the arena
		if(this.position.x < 0 || this.position.y < 0 ||
			this.position.x > app.arenaWidth || this.position.y > app.arenaHeight)
		{
			this.degToTarget = this.baseRotationDeg = Math.radToDeg(
				Math.atan2(
					target.position.y - this.position.y, 
					target.position.x - this.position.x
				)
			);
		}
		else //within the arena
		{
			this.navigation.update(this.position, target.position);

			this.degToTarget = this.baseRotationDeg = Math.radToDeg(
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

	RotationUtils.updateRotation(this, this.container, 90);

	this.walkAnimUtil.update();
};

/**
*@public
*/
EnemyTrooper.prototype.enterSniping = function(options) {
	var self = this,
		maxIndex = EnemySnipingState.NEXT_STATE_MAP.length - 1,
		randIndex = Math.randomInRangeWhole(0, maxIndex),
		randRoamTime = Math.randomInRangeWhole(
			EnemyTrooper.MIN_SNIPE_TIME, 
			EnemyTrooper.MAX_SNIPE_TIME
		);

	this.walkAnimUtil.stop();

	this.fireCounter = 0;
	this.fireThreshold = 30;

	this.clearTimer();

	this.timer = setTimeout(function() {
		self.stateMachine.setState(EnemySnipingState.NEXT_STATE_MAP[randIndex]);
	}, randRoamTime);
};

/**
*@public
*/
EnemyTrooper.prototype.updateSniping = function(options) {
	var target = options.target,
		sin,
		cos,
		table = app.trigTable;

	//only calculates homing to target on selected frames
	if(target && createjs.Ticker.getTicks() % EnemyTrooper.HOMING_RATE === 0) {
		this.degToTarget = this.baseRotationDeg = Math.radToDeg(
			Math.atan2(
				target.position.y - this.position.y, 
				target.position.x - this.position.x
			)
		);
	}

	RotationUtils.updateRotation(this, this.container, 90);

	this.updateFiring();
};

/**
*@public
*/
EnemyTrooper.prototype.enterStrafing = function(options) {
	var self = this;
	var maxIndex = EnemyStrafingState.NEXT_STATE_MAP.length - 1;
	var randIndex = Math.randomInRangeWhole(0, maxIndex);
	var randRoamTime = Math.randomInRangeWhole(
		EnemyTrooper.MIN_STRAFE_TIME, 
		EnemyTrooper.MAX_STRAFE_TIME
	);

	this.walkAnimUtil.play();
	this.walkAnimUtil.loop(true);

	this.fireCounter = 0;
	this.fireThreshold = 60;

	this.clearTimer();

	this.timer = setTimeout(function() {
		self.stateMachine.setState(EnemyStrafingState.NEXT_STATE_MAP[randIndex]);
	}, randRoamTime);
};

/**
*@public
*/
EnemyTrooper.prototype.updateStrafing = function(options) {
	var target = options.target,
			sin,
			cos,
			table = app.trigTable;

	//only calculates homing to target on selected frames
	if(target && createjs.Ticker.getTicks() % EnemyTrooper.HOMING_RATE === 0) {

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

			this.degToTarget = Math.radToDeg(
				Math.atan2(
					this.navigation.targetPosition.y - this.position.y, 
					this.navigation.targetPosition.x - this.position.x
				)
			);

			this.baseRotationDeg = Math.radToDeg(
				Math.atan2(
					target.position.y - this.position.y, 
					target.position.x - this.position.x
				)
			);
		}

		this.velocity.x = (table.cos(this.degToTarget) * this.velocityMod);
		this.velocity.y = (table.sin(this.degToTarget) * this.velocityMod);
	}

	this.container.x += this.velocity.x;
	this.container.y += this.velocity.y;

	this.setPosition(this.container.x, this.container.y);

	RotationUtils.updateRotation(this, this.container, 90);

	this.walkAnimUtil.update();

	this.updateFiring();
};

/**
*@override
*@public
*/
EnemyTrooper.prototype.clear = function() {
	Enemy.prototype.clear.call(this);

	this.projectileSystem = null;

	this.shape = null;

	this.navigation.clear();
	this.navigation = null;

	this.stateMachine.clear();
	this.stateMachine = null;

	this.walkAnimUtil.clear();
	this.walkAnimUtil = null;
};

EnemyTrooper.prototype.setIsAlive = function(value) {
	Enemy.prototype.setIsAlive.call(this, value);

	(value) ? this.stateMachine.setState(EnemyRoamingState.KEY) : this.clearTimer();
};

/**
*@public
*/
EnemyTrooper.prototype.kill = function() {
	if(this.isAlive) {
		this.setIsAlive(false);

		this.stateMachine.reset();

		this.navigation.reset();

		this.container.getStage().removeChild(this.container);

		this.dispatchKillEvent();
	}
};

/**
 *Face player and fires
*@public
*/
EnemyTrooper.prototype.updateFiring = function(options) {
	//check fire
	if(this.fireCounter++ > this.fireThreshold) {
		this.fire();
		this.fireCounter = 0;
	}
};

/**
*@private
*/
EnemyTrooper.prototype.fire = function() {
	var deg,
		sin,
		cos,
		firingPosDeg,
		firingPosSin,
		firingPosCos,
		vector2D = new app.b2Vec2(),
		trigTable = app.trigTable,
		stage = this.container.getStage(),
		projectile = null

	sin = trigTable.sin(this.baseRotationDeg);
	cos = trigTable.cos(this.baseRotationDeg);

	//acquire values to determine firing position
	firingPosDeg = this.baseRotationDeg + EnemyTrooper.FIRE_OFFSET;
	firingPosSin = trigTable.sin(firingPosDeg);
	firingPosCos = trigTable.cos(firingPosDeg);

	projectile = this.projectileSystem.getProjectile();

	if(projectile) {			
		//zero out existing linear velocity
		projectile.body.SetLinearVelocity(app.vecZero);
		
		vector2D.x = (this.position.x / app.physicsScale) + (firingPosCos * EnemyTrooper.AMMO_DISTANCE);
		vector2D.y = (this.position.y / app.physicsScale) + (firingPosSin * EnemyTrooper.AMMO_DISTANCE);				
		projectile.body.SetPosition(vector2D);
		
		vector2D.x = cos * projectile.velocityMod;
		vector2D.y = sin * projectile.velocityMod;		
		projectile.body.ApplyForce(vector2D, projectile.body.GetWorldCenter());

		projectile.setIsAlive(true);
		
		projectile.shape.rotation = this.container.rotation;
		stage.addChild(projectile.shape);
	}
};

/**
*@private
*/
EnemyTrooper.prototype.setPosition = function(x, y) {
	this.position.x = this.container.x = x;
	this.position.y = this.container.y = y;

	this.physicalPosition.x = this.position.x / app.physicsScale;
	this.physicalPosition.y = this.position.y / app.physicsScale;
	
	this.body.SetPosition(this.physicalPosition);
};

EnemyTrooper.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef();
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = this.categoryBits;
	fixDef.filter.maskBits = this.maskBits;
	fixDef.isSensor = true;
	fixDef.shape = new app.b2CircleShape(0.65);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetAwake(true);
};

EnemyTrooper.prototype.setStateMachine = function() {
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

goog.exportSymbol('EnemyTrooper', EnemyTrooper);