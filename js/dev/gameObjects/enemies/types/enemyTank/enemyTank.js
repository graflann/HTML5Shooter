goog.provide('EnemyTank');

goog.require('Enemy');
goog.require('Navigation');
goog.require('EnemyDroneTurret');
goog.require('EnemyTankRoamingState');
goog.require('EnemyTankSnipingState');
goog.require('EnemyTankStrafingState');

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

	this.base = null;

	this.turret = null;

	this.turretOffsetY = 6;

	this.homingRate = 15;

	this.navigation = null;

	this.health = 1;

	this.intendedRotation = 0;

	this.rotationRate = 5;

	this.baseRotationDeg = 0;

	this.stateMachine = null;

	this.init();
};

goog.inherits(EnemyTank, Enemy);

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

	this.base = new createjs.BitmapAnimation(droneBaseSpriteSheet);
	this.base.regX = this.width * 0.5;
	this.base.regY = this.height * 0.5;
	this.base.gotoAndStop(0);
	this.container.addChild(this.base);

	this.turret = new EnemyDroneTurret(true, [ this.projectileSystem ]);
	this.turret.fireCounter = 0;
	this.turret.fireThreshold = 90;
	this.container.addChild(this.turret.shape);

	this.setPhysics();

	this.navigation = new Navigation();

	this.setStateMachine();

	this.setIsAlive(false);
};

/**
*@override
*@public
*/
EnemyTank.prototype.update = function(options) {

	if(this.isAlive) {	
		this.stateMachine.update(options);
	}
};

EnemyTank.prototype.updateBase = function(options) {
	var target = options.target,
			sin,
			cos,
			table = app.trigTable;

	//only calculates homing to target on selected frames
	if(target && createjs.Ticker.getTicks() % this.homingRate == 0) {

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

	this.updateRotation();
};

/**
*@override
*@public
*/
EnemyTank.prototype.updateTurretToBase = function(options) {
	//ensure the turret faces the direction the tank is moving when roaming
	this.turret.baseRotationDeg = this.baseRotationDeg;
	this.turret.updateRotation();
};

/**
*@public
*/
EnemyTank.prototype.enterRoaming = function(options) {
	this.base.play();
}

/**
*@public
*/
EnemyTank.prototype.updateRoaming = function(options) {
	this.updateBase(options);
	this.updateTurretToBase(options);
}

/**
*@public
*/
EnemyTank.prototype.enterSniping = function(options) {
	this.base.gotoAndStop(0);
}

/**
*@public
*/
EnemyTank.prototype.updateSniping = function(options) {
	this.turret.update({ target: options.target.position });
}

/**
*@public
*/
EnemyTank.prototype.enterStrafing = function(options) {
	this.base.play();
}

/**
*@public
*/
EnemyTank.prototype.updateStrafing = function(options) {
	this.updateBase(options);
	this.turret.update({ target: options.target.position });
}


/**
*@private
*/
EnemyTank.prototype.updateRotation = function() {
	var absAngleDif = 0;

	//art is natively offset by 90 deg compared to default createJS rotation value so an adjustment is made
	this.intendedRotation = this.baseRotationDeg + 90;

	//adjust intended for 
	if(this.intendedRotation >= 360) {
		this.intendedRotation -= 360;
	} else if(this.intendedRotation < 0) {
		this.intendedRotation += 360;
	}

	absAngleDif = Math.abs(this.intendedRotation - this.base.rotation);

	//continuously update rotation 
	if(absAngleDif > this.rotationRate)
	{
		if(absAngleDif >= 180) {
			if(this.intendedRotation > this.base.rotation) {
				this.rotateToAngle(-this.rotationRate);
			}
			else if(this.intendedRotation < this.base.rotation) {
				this.rotateToAngle(this.rotationRate);
			}
		} else {
			if(this.intendedRotation > this.base.rotation) {
				this.rotateToAngle(this.rotationRate);
			}
			else if(this.intendedRotation < this.base.rotation) {
				this.rotateToAngle(-this.rotationRate);
			}
		}
	}
};

/**
*@private
*/
EnemyTank.prototype.rotateToAngle = function(rotationRate) {
	if(rotationRate == 0) {
		return;
	}

	this.base.rotation += rotationRate;

	if(this.base.rotation <= 0) {
		this.base.rotation += 360;
	}

	if(this.base.rotation >= 360) {
		this.base.rotation -= 360;
	}
};

/**
*@override
*@public
*/
EnemyTank.prototype.clear = function() {
	
};

/**
*@override
*@public
*/
EnemyTank.prototype.setIsAlive = function(value) {
	Enemy.prototype.setIsAlive.call(this, value);

	(this.isAlive) ? this.base.play() : this.base.gotoAndStop(0);
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
		EnemyTankRoamingState.KEY,
		new EnemyTankRoamingState(this),
		[ EnemyTankSnipingState.KEY, EnemyTankStrafingState.KEY ]
	);

	this.stateMachine.addState(
		EnemyTankSnipingState.KEY,
		new EnemyTankSnipingState(this),
		[ EnemyTankRoamingState.KEY, EnemyTankStrafingState.KEY ]
	);

	this.stateMachine.addState(
		EnemyTankStrafingState.KEY,
		new EnemyTankStrafingState(this),
		[ EnemyTankRoamingState.KEY, EnemyTankSnipingState.KEY ]
	);
	
	this.stateMachine.setState(EnemyTankRoamingState.KEY);
};

goog.exportSymbol('EnemyTank', EnemyTank);