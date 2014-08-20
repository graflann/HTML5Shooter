goog.provide('EnemyRanger');

goog.require('EnemyTrooper');

EnemyRanger = function(projectileSystem) {
	EnemyTrooper.call(this);

	/**
	 * @type {Array}
	 */
	this.projectileSystem = projectileSystem;

	this.fireThreshold = 0;

	this.fireCounter = 0;

	this.init();
};

goog.inherits(EnemyRanger, EnemyTrooper);

EnemyRanger.HOMING_RATE = 15;

EnemyRanger.AMMO_DISTANCE = 16 / Constants.PHYSICS_SCALE;

EnemyRanger.FIRE_OFFSET = -20;

EnemyRanger.MIN_STRAFE_TIME = 2000;
EnemyRanger.MAX_STRAFE_TIME = 4000;

EnemyRanger.MIN_ROAM_TIME = 500;
EnemyRanger.MAX_ROAM_TIME = 5000;

EnemyRanger.MIN_SNIPE_TIME = 2000;
EnemyRanger.MAX_SNIPE_TIME = 4000;

/**
*@override
*@public
*/
EnemyRanger.prototype.init = function() {
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

	this.collisionRoutingObject = new CollisionRoutingObject();
	this.collisionRoutingObject.type = EnemyTypes.RANGER;

	EnemyTrooper.prototype.init.call(this);
};

/**
*@public
*/
EnemyRanger.prototype.enterRoaming = function(options) {
	var self = this,
		maxIndex = EnemyRoamingState.NEXT_STATE_MAP.length - 1,
		randIndex = Math.randomInRangeWhole(0, maxIndex),
		randRoamTime = Math.randomInRangeWhole(
			EnemyRanger.MIN_ROAM_TIME, 
			EnemyRanger.MAX_ROAM_TIME
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
EnemyRanger.prototype.updateRoaming = function(options) {
	var target = options.target,
			sin,
			cos,
			table = app.trigTable;

	//only calculates homing to target on selected frames
	if(target && createjs.Ticker.getTicks() % EnemyRanger.HOMING_RATE === 0) {

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
EnemyRanger.prototype.enterSniping = function(options) {
	var self = this,
		maxIndex = EnemySnipingState.NEXT_STATE_MAP.length - 1,
		randIndex = Math.randomInRangeWhole(0, maxIndex),
		randSnipeTime = Math.randomInRangeWhole(
			EnemyRanger.MIN_SNIPE_TIME, 
			EnemyRanger.MAX_SNIPE_TIME
		);

	this.walkAnimUtil.stop();

	this.fireCounter = 0;
	this.fireThreshold = 30;

	this.clearTimer();

	this.timer = setTimeout(function() {
		self.stateMachine.setState(EnemySnipingState.NEXT_STATE_MAP[randIndex]);
	}, randSnipeTime);
};

/**
*@public
*/
EnemyRanger.prototype.updateSniping = function(options) {
	var target = options.target,
		sin,
		cos,
		table = app.trigTable;

	//only calculates homing to target on selected frames
	if(target && createjs.Ticker.getTicks() % EnemyRanger.HOMING_RATE === 0) {
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
EnemyRanger.prototype.enterStrafing = function(options) {
	var self = this;
	var maxIndex = EnemyStrafingState.NEXT_STATE_MAP.length - 1;
	var randIndex = Math.randomInRangeWhole(0, maxIndex);
	var randStrafeTime = Math.randomInRangeWhole(
		EnemyRanger.MIN_STRAFE_TIME, 
		EnemyRanger.MAX_STRAFE_TIME
	);

	this.walkAnimUtil.play();
	this.walkAnimUtil.loop(true);

	this.fireCounter = 0;
	this.fireThreshold = 60;

	this.clearTimer();

	this.timer = setTimeout(function() {
		self.stateMachine.setState(EnemyStrafingState.NEXT_STATE_MAP[randIndex]);
	}, randStrafeTime);
};

/**
*@public
*/
EnemyRanger.prototype.updateStrafing = function(options) {
	var target = options.target,
			sin,
			cos,
			table = app.trigTable;

	//only calculates homing to target on selected frames
	if(target && createjs.Ticker.getTicks() % EnemyRanger.HOMING_RATE === 0) {

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
EnemyRanger.prototype.clear = function() {
	EnemyTrooper.prototype.clear.call(this);

	this.projectileSystem = null;
};

EnemyRanger.prototype.setIsAlive = function(value) {
	Enemy.prototype.setIsAlive.call(this, value);

	if(this.isAlive) {
		this.health = 1;
		this.stateMachine.setState(EnemyRoamingState.KEY);
	} else {
		this.clearTimer();
	}
};

/**
 *Face player and fires
*@public
*/
EnemyRanger.prototype.updateFiring = function(options) {
	//check fire
	if(this.fireCounter++ > this.fireThreshold) {
		this.fire();
		this.fireCounter = 0;
	}
};

/**
*@private
*/
EnemyRanger.prototype.fire = function() {
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
	firingPosDeg = this.baseRotationDeg + EnemyRanger.FIRE_OFFSET;
	firingPosSin = trigTable.sin(firingPosDeg);
	firingPosCos = trigTable.cos(firingPosDeg);

	projectile = this.projectileSystem.getProjectile();

	if(projectile) {			
		//zero out existing linear velocity
		projectile.body.SetLinearVelocity(app.vecZero);
		
		vector2D.x = (this.position.x / app.physicsScale) + (firingPosCos * EnemyRanger.AMMO_DISTANCE);
		vector2D.y = (this.position.y / app.physicsScale) + (firingPosSin * EnemyRanger.AMMO_DISTANCE);				
		projectile.body.SetPosition(vector2D);
		
		vector2D.x = cos * projectile.velocityMod;
		vector2D.y = sin * projectile.velocityMod;		
		projectile.body.ApplyForce(vector2D, projectile.body.GetWorldCenter());

		projectile.setIsAlive(true);
		
		projectile.shape.rotation = this.container.rotation;
		stage.addChild(projectile.shape);
	}
};

EnemyRanger.prototype.setStateMachine = function() {
	EnemyTrooper.prototype.setStateMachine.call(this);

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
};

goog.exportSymbol('EnemyRanger', EnemyRanger);