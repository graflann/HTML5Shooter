goog.provide('EnemyCopter');

goog.require('Enemy');
goog.require('Rotor');
goog.require('EnemyCopterFiringState');
goog.require('EnemyCopterSeekingState');

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

	this.hasTarget = false;

	this.firingPosition = new app.b2Vec2();

	this.stateMachine = null;

	this.init();
};

goog.inherits(EnemyCopter, Enemy);

/**
*@override
*@public
*/
EnemyCopter.prototype.init = function() {
	this.container = new createjs.Container();

	this.width = 89;
	this.height = 107;

	this.velocityMod = 1;

	this.fireThreshold = 15;

	this.shape = new createjs.BitmapAnimation(app.assetsProxy.arrSpriteSheet["copter"]);
	this.shape.regX = 44;
	this.shape.regY = 53;
	this.container.addChild(this.shape);

	this.shape.gotoAndStop(0);

	for(var i = 0; i < this.arrRotors.length; i++) {
		this.arrRotors[i] = new Rotor(Constants.YELLOW, 16);
		this.container.addChild(this.arrRotors[i].shape);
	}

	this.arrRotors[0].shape.x = this.shape.regX - 22;
	this.arrRotors[1].shape.x = this.shape.regX - 66;
	this.arrRotors[0].shape.y = this.arrRotors[1].shape.y = this.shape.regY - 51;

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

		this.stateMachine.update(options);

		if(!this.hasTarget && target != null) {
			this.hasTarget = true;

			this.stateMachine.setState(EnemyCopterSeekingState.KEY);
		}

		//rotors always rotate...
		while(++i < this.arrRotors.length) {
			this.arrRotors[i].update();
		}

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
EnemyCopter.prototype.updateSeeking = function(options) {
	var target = options.target,
		deg,
		sin,
		cos,
		table = app.trigTable;

	//only calculates homing to target on selected frames
	if(target && createjs.Ticker.getTicks() % this.homingRate == 0) {
		deg = Math.radToDeg(
			Math.atan2(
				target.position.y - this.position.y, 
				target.position.x - this.position.x
			)
		);

		this.velocity.x = (table.cos(deg) * this.velocityMod);
		this.velocity.y = (table.sin(deg) * this.velocityMod);

		this.container.rotation = deg + 90;
	}

	this.container.x += this.velocity.x;
	this.container.y += this.velocity.y;

	this.setPosition(this.container.x, this.container.y);
};

/**
*@public
*/
EnemyCopter.prototype.updateFiring = function(options) {
	//face player and fire in bursts

	//handle fire
	if(this.fireCounter++ > this.fireThreshold) {
		this.fire();
		this.fireCounter = 0;
	}
};

/**
*@public
*/
EnemyCopter.prototype.fire = function() {
	
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
		State.KEY,
		new State(),
		[ EnemyCopterSeekingState.KEY ]
	);

	this.stateMachine.addState(
		EnemyCopterSeekingState.KEY,
		new EnemyCopterSeekingState(this),
		[ State.KEY, EnemyCopterFiringState.KEY ]
	);

	this.stateMachine.addState(
		EnemyCopterFiringState.KEY,
		new EnemyCopterFiringState(this),
		[ State.KEY, EnemyCopterSeekingState.KEY ]
	);
	
	this.stateMachine.setState(State.KEY);
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