goog.provide('EnemyTrooper');

goog.require('Enemy');
goog.require('Navigation');
goog.require('EnemyRoamingState');
goog.require('EnemySnipingState');
goog.require('EnemyStrafingState');
goog.require('RotationUtils');

EnemyTrooper = function() {
	Enemy.call(this);

	this.categoryBits = CollisionCategories.GROUND_ENEMY;

	this.maskBits = CollisionCategories.PLAYER_PROJECTILE | CollisionCategories.PLAYER_BASE;

	this.shape = null;

	this.navigation = null;

	this.intendedRotation = 0;

	this.rotationRate = 15;

	this.baseRotationDeg = 0;

	this.degToTarget = 0;

	this.stateMachine = null;

	this.walkAnimUtil = null;
};

goog.inherits(EnemyTrooper, Enemy);

EnemyTrooper.HOMING_RATE = 15;

/**
*@override
*@public
*/
EnemyTrooper.prototype.init = function() {
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
*@override
*@public
*/
EnemyTrooper.prototype.clear = function() {
	Enemy.prototype.clear.call(this);

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

	if(this.isAlive) {
		this.health = 1;
		this.stateMachine.setState(EnemyRoamingState.KEY);
	} else {
		this.clearTimer();
	}
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
};

goog.exportSymbol('EnemyTrooper', EnemyTrooper);