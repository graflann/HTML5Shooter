goog.provide('EnemyTrooper');

goog.require('Enemy');
goog.require('Navigation');
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

	this.intendedRotation = 0;

	this.rotationRate = 5;

	this.baseRotationDeg = 0;

	this.stateMachine = null;

	this.init();
};

goog.inherits(EnemyTrooper, Enemy);

EnemyTrooper.HOMING_RATE = 15;

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
	this.shape.gotoAndStop(0);
	this.shape.cache(0, 0, this.width, this.height);
	this.shape.regX = this.width * 0.5;
	this.shape.regY = this.height * 0.5;
	this.container.addChild(this.shape);

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
		//this.stateMachine.update(options);

		this.updateRoaming(options);
	}
};

/**
*@public
*/
EnemyTrooper.prototype.enterRoaming = function(options) {
	
}

/**
*@public
*/
EnemyTrooper.prototype.updateRoaming = function(options) {
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

	RotationUtils.updateRotation(this, this.container, 90);
}

/**
*@public
*/
EnemyTrooper.prototype.enterSniping = function(options) {
	
}

/**
*@public
*/
EnemyTrooper.prototype.updateSniping = function(options) {
	
}

/**
*@public
*/
EnemyTrooper.prototype.enterStrafing = function(options) {
	
}

/**
*@public
*/
EnemyTrooper.prototype.updateStrafing = function(options) {
	
}

/**
*@override
*@public
*/
EnemyTrooper.prototype.clear = function() {
	
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
	fixDef.shape = new app.b2CircleShape(0.5);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetAwake(true);
};

EnemyTrooper.prototype.setStateMachine = function() {
	// this.stateMachine = new StateMachine();

	// this.stateMachine.addState(
	// 	EnemyTankRoamingState.KEY,
	// 	new EnemyTankRoamingState(this),
	// 	[ EnemyTankSnipingState.KEY, EnemyTankStrafingState.KEY ]
	// );

	// this.stateMachine.addState(
	// 	EnemyTankSnipingState.KEY,
	// 	new EnemyTankSnipingState(this),
	// 	[ EnemyTankRoamingState.KEY, EnemyTankStrafingState.KEY ]
	// );

	// this.stateMachine.addState(
	// 	EnemyTankStrafingState.KEY,
	// 	new EnemyTankStrafingState(this),
	// 	[ EnemyTankRoamingState.KEY, EnemyTankSnipingState.KEY ]
	// );
	
	// this.stateMachine.setState(EnemyTankRoamingState.KEY);
};

goog.exportSymbol('EnemyTrooper', EnemyTrooper);