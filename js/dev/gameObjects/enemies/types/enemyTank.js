goog.provide('EnemyTank');

goog.require('Enemy');
goog.require('Navigation');

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

	this.init();
};

goog.inherits(EnemyTank, Enemy);

/**
*@override
*@public
*/
EnemyTank.prototype.init = function() {
	var droneBaseSpriteSheet = app.assetsProxy.arrSpriteSheet["enemyDroneBase"],
		droneTurretSpriteSheet = app.assetsProxy.arrSpriteSheet["enemyDroneTurret"];

	this.container = new createjs.Container();

	this.width = droneBaseSpriteSheet._frames[0].rect.width;
	this.height = droneBaseSpriteSheet._frames[0].rect.height;

	this.velocityMod = 1.5;

	this.base = new createjs.BitmapAnimation(droneBaseSpriteSheet);
	this.base.regX = this.width * 0.5;
	this.base.regY = this.height * 0.5;
	this.base.gotoAndStop(0);
	this.container.addChild(this.base);

	this.turret = new createjs.BitmapAnimation(droneTurretSpriteSheet);
	this.turret.regX = droneTurretSpriteSheet._frames[0].rect.width * 0.5;
	this.turret.regY = (droneTurretSpriteSheet._frames[0].rect.height * 0.5) + this.turretOffsetY;
	this.turret.gotoAndStop(0);
	this.container.addChild(this.turret);

	this.setPhysics();

	this.navigation = new Navigation();

	this.setIsAlive(false);
};

/**
*@override
*@public
*/
EnemyTank.prototype.update = function(options) {

	if(this.isAlive) {
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

		//this.container.rotation = this.baseRotationDeg + 90;

		this.container.x += this.velocity.x;
		this.container.y += this.velocity.y;

		this.setPosition(this.container.x, this.container.y);

		this.updateRotation();
	}
};

/**
*@private
*/
EnemyTank.prototype.updateRotation = function() {
	var absAngleDif = 0;

	this.intendedRotation = this.baseRotationDeg + 90;

	//adjust intended for 
	if(this.intendedRotation >= 360) {
		this.intendedRotation -= 360;
	} else if(this.intendedRotation < 0) {
		this.intendedRotation += 360;
	}

	absAngleDif = Math.abs(this.intendedRotation - this.container.rotation);

	//continuously update rotation 
	if(absAngleDif > this.rotationRate)
	{
		if(absAngleDif >= 180) {
			if(this.intendedRotation > this.container.rotation) {
				this.rotateToAngle(-this.rotationRate);
			}
			else if(this.intendedRotation < this.container.rotation) {
				this.rotateToAngle(this.rotationRate);
			}
		} else {
			if(this.intendedRotation > this.container.rotation) {
				this.rotateToAngle(this.rotationRate);
			}
			else if(this.intendedRotation < this.container.rotation) {
				this.rotateToAngle(-this.rotationRate);
			}
		}
	}
};

/**
*@private
*/
EnemyTank.prototype.rotateToAngle = function(rotationRate) {
	if(rotationRate == 0){
		return;
	}

	this.container.rotation += rotationRate;

	if(this.container.rotation <= 0) {
		this.container.rotation += 360;
	}

	if(this.container.rotation >= 360) {
		this.container.rotation -= 360;
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

goog.exportSymbol('EnemyTank', EnemyTank);