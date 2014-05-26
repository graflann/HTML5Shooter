goog.provide('EnemyFencer');

goog.require('EnemyTrooper');
goog.require('Shield');

EnemyFencer = function(projectileSystem) {
	EnemyTrooper.call(this);

	/**
	 * @type {Array}
	 */
	this.projectileSystem = projectileSystem;

	this.fireThreshold = 0;

	this.fireCounter = 0;

	this.shield = null;

	this.init();
};

goog.inherits(EnemyFencer, EnemyTrooper);

EnemyFencer.HOMING_RATE = 15;

EnemyFencer.AMMO_DISTANCE = 16 / Constants.PHYSICS_SCALE;

EnemyFencer.FIRE_OFFSET = -20;

EnemyFencer.MIN_ROAM_TIME = 500;
EnemyFencer.MAX_ROAM_TIME = 5000;

EnemyFencer.MIN_SNIPE_TIME = 1000;
EnemyFencer.MAX_SNIPE_TIME = 1000;

EnemyFencer.ATTACK_DISTANCE = Math.pow(65, 2);

/**
*@override
*@public
*/
EnemyFencer.prototype.init = function() {
	var trooperSpriteSheet = app.assetsProxy.arrSpriteSheet["enemyFencer"];

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

	this.shield = new Shield([Constants.YELLOW, Constants.DARK_RED, Constants.RED], 20, 1);

	this.collisionRoutingObject = new CollisionRoutingObject();
	this.collisionRoutingObject.type = EnemyTypes.FENCER;

	EnemyTrooper.prototype.init.call(this);
};

EnemyFencer.prototype.addShield = function() {
	if(!this.shield.isAlive) {
		app.layers.getStage(LayerTypes.MAIN).addChild(this.shield.container);

		this.shield.setIsAlive(true);
	}
};

EnemyFencer.prototype.removeShield = function() {
	if(this.shield.isAlive) {
		app.layers.getStage(LayerTypes.MAIN).removeChild(this.shield.container);

		this.shield.setIsAlive(false);
	}
};

/**
*@public
*/
EnemyFencer.prototype.enterRoaming = function(options) {
	// var self = this,
	// 	maxIndex = EnemyRoamingState.NEXT_STATE_MAP.length - 1,
	// 	randIndex = Math.randomInRangeWhole(0, maxIndex),
	// 	randRoamTime = Math.randomInRangeWhole(
	// 		EnemyFencer.MIN_ROAM_TIME, 
	// 		EnemyFencer.MAX_ROAM_TIME
	// 	);

	this.walkAnimUtil.play();
	this.walkAnimUtil.loop(true);

	// this.clearTimer();

	// this.timer = setTimeout(function() {
	// 	self.stateMachine.setState(EnemyRoamingState.NEXT_STATE_MAP[randIndex]);
	// }, randRoamTime);

	this.addShield();
};

/**
*@public
*/
EnemyFencer.prototype.updateRoaming = function(options) {
	var target = options.target,
		sin,
		cos,
		table = app.trigTable;

	//only calculates homing to target on selected frames
	if(target && createjs.Ticker.getTicks() % EnemyFencer.HOMING_RATE === 0) {
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

	if(this.position.DistanceSqrd(target.position) < EnemyFencer.ATTACK_DISTANCE) {
		this.stateMachine.setState(EnemySnipingState.KEY, options);
	}
};

/**
*@public
*/
EnemyFencer.prototype.enterSniping = function(options) {
	var self = this,
		target = options.target,
		maxIndex = EnemySnipingState.NEXT_STATE_MAP.length - 1,
		randIndex = Math.randomInRangeWhole(0, maxIndex),
		randSnipeTime = Math.randomInRangeWhole(
			EnemyFencer.MIN_SNIPE_TIME, 
			EnemyFencer.MAX_SNIPE_TIME
		);

	this.walkAnimUtil.stop();

	this.fireCounter = 0;
	this.fireThreshold = 2;

	this.navigation.update(this.position, target.position);

	this.removeShield();

	this.clearTimer();

	this.timer = setTimeout(function() {
		self.stateMachine.setState(EnemyRoamingState.KEY);
	}, randSnipeTime);
};

/**
*@public
*/
EnemyFencer.prototype.updateSniping = function(options) {
	var target = options.target,
		sin,
		cos,
		table = app.trigTable;

	//only calculates homing to target on selected frames
	if(target && createjs.Ticker.getTicks() % EnemyFencer.HOMING_RATE === 0) {
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
*@override
*@public
*/
EnemyFencer.prototype.clear = function() {
	EnemyTrooper.prototype.clear.call(this);

	this.shield.clear();
	this.shield = null;
};

EnemyFencer.prototype.setIsAlive = function(value) {
	Enemy.prototype.setIsAlive.call(this, value);

	if(this.isAlive) {
		this.health = 1;
		this.stateMachine.setState(EnemyRoamingState.KEY);
	} else {
		this.clearTimer();
		this.removeShield();
	}
};

/**
 *Face player and fires
*@public
*/
EnemyFencer.prototype.updateFiring = function(options) {
	//check fire
	if(this.fireCounter++ > this.fireThreshold) {
		this.fire();
		this.fireCounter = 0;
	}
};

/**
*@private
*/
EnemyFencer.prototype.fire = function() {
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
	firingPosDeg = this.baseRotationDeg + EnemyFencer.FIRE_OFFSET;
	firingPosSin = trigTable.sin(firingPosDeg);
	firingPosCos = trigTable.cos(firingPosDeg);

	projectile = this.projectileSystem.getProjectile();

	if(projectile) {			
		//zero out existing linear velocity
		projectile.body.SetLinearVelocity(app.vecZero);
		
		vector2D.x = (this.position.x / app.physicsScale) + (firingPosCos * EnemyFencer.AMMO_DISTANCE);
		vector2D.y = (this.position.y / app.physicsScale) + (firingPosSin * EnemyFencer.AMMO_DISTANCE);				
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
EnemyFencer.prototype.setPosition = function(x, y) {
	this.position.x = this.container.x = x;
	this.position.y = this.container.y = y;

	this.physicalPosition.x = this.position.x / app.physicsScale;
	this.physicalPosition.y = this.position.y / app.physicsScale;
	
	this.body.SetPosition(this.physicalPosition);

	this.shield.update({ target:this });
};

EnemyFencer.prototype.setPhysics = function() {
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

EnemyFencer.prototype.setStateMachine = function() {
	EnemyTrooper.prototype.setStateMachine.call(this);

	this.stateMachine.addState(
		EnemyRoamingState.KEY,
		new EnemyRoamingState(this),
		[ EnemySnipingState.KEY ]
	);

	this.stateMachine.addState(
		EnemySnipingState.KEY,
		new EnemySnipingState(this),
		[ EnemyRoamingState.KEY ]
	);
};

goog.exportSymbol('EnemyFencer', EnemyFencer);