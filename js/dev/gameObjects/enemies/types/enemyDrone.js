goog.provide('EnemyDrone');

goog.require('Enemy');
goog.require('Navigation');

/**
*@constructor
*/
EnemyDrone = function(projectileSystem) {
	Enemy.call(this);

	/**
	 * @type {Array}
	 */
	this.projectileSystem = projectileSystem;

	this.categoryBits = CollisionCategories.GROUND_ENEMY;

	this.maskBits = CollisionCategories.PLAYER_PROJECTILE | CollisionCategories.PLAYER_BASE;

	this.base = null;

	this.turret = null;

	this.homingRate = 15;

	this.navigation = null;

	this.arenaWidth = Constants.WIDTH * 4;
	this.arenaHeight = Constants.HEIGHT * 2;

	this.health = 1;

	this.baseRotationDeg = 0;

	this.init();
};

goog.inherits(EnemyDrone, Enemy);

/**
*@override
*@public
*/
EnemyDrone.prototype.init = function() {
	this.container = new createjs.Container();

	this.width = 33;
	this.height = 39;

	this.velocityMod = 1;

	this.base = new createjs.BitmapAnimation(app.assetsProxy.arrSpriteSheet["enemyDroneBase"]);
	this.base.regX = this.width * 0.5;
	this.base.regY = this.height * 0.5;
	this.base.gotoAndStop(0);
	
	this.container.addChild(this.base);

	this.setPhysics();

	this.navigation = new Navigation();

	this.setIsAlive(false);
};

/**
*@override
*@public
*/
EnemyDrone.prototype.update = function(options) {

	if(this.isAlive) {
		var target = options.target,
			sin,
			cos,
			table = app.trigTable;

		//only calculates homing to target on selected frames
		if(target && createjs.Ticker.getTicks() % this.homingRate == 0) {

			//out of the arena
			if(this.position.x < 0 || this.position.y < 0 ||
				this.position.x > this.arenaWidth || this.position.y > this.arenaHeight)
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

		this.base.rotation = this.baseRotationDeg + 90;

		this.container.x += this.velocity.x;
		this.container.y += this.velocity.y;

		this.setPosition(this.container.x, this.container.y);
	}
};

/**
*@override
*@public
*/
EnemyDrone.prototype.clear = function() {
	
};

/**
*@override
*@public
*/
EnemyDrone.prototype.setIsAlive = function(value) {
	Enemy.prototype.setIsAlive.call(this, value);

	this.base.play();
};

/**
*@private
*/
EnemyDrone.prototype.setPosition = function(x, y) {
	this.position.x = this.container.x = x;
	this.position.y = this.container.y = y;

	this.physicalPosition.x = this.position.x / app.physicsScale;
	this.physicalPosition.y = this.position.y / app.physicsScale;
	
	this.body.SetPosition(this.physicalPosition);
};

EnemyDrone.prototype.setPhysics = function() {
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

goog.exportSymbol('EnemyDrone', EnemyDrone);