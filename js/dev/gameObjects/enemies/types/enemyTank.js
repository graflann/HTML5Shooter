goog.provide('EnemyTank');

goog.require('Enemy');
goog.require('Turret');
goog.require('TurretClasses');
goog.require('TurretTypes');

/**
*@constructor
*/
EnemyTank = function(projectileSystem) {
	Enemy.call(this);

	/**
	 * @type {Array}
	 */
	this.projectileSystem = projectileSystem;

	this.turretType = projectileSystem.type;

	this.categoryBits = CollisionCategories.GROUND_ENEMY;

	this.maskBits = CollisionCategories.PLAYER_PROJECTILE;

	this.turretBody = null;

	/**
	*@type  {String}
	*/
	this.color = Constants.RED;

	this.base = null;

	this.turret = null;

	this.force = new app.b2Vec2();

	this.rad = 0;
	this.deg = 0;

	this.init();
};

goog.inherits(EnemyTank, Enemy);

/**
*@override
*@public
*/
EnemyTank.prototype.init = function() {
	this.container = new createjs.Container();

	this.width = 48;
	this.height = 64;

	this.velocity.x = 2400;
	this.velocity.y = 2400;

	this.base = new createjs.BitmapAnimation(app.assetsProxy.arrSpriteSheet["enemyTankBase"]);
	this.base.x = this.base.regX = this.width * 0.5;
	this.base.y = this.base.regY = this.height * 0.5;
	this.container.addChild(this.base);

	this.setTurret();

	this.base.gotoAndStop(0);

	this.setPhysics();

	this.setIsAlive(false);
};

/**
*@override
*@public
*/
EnemyTank.prototype.update = function(options) {
	if(this.isAlive) {
		var target = options.target,
			trigTable = app.trigTable,
			worldCenter = this.body.GetWorldCenter();


		//zero out any linear velocity
		this.body.SetLinearVelocity(app.vecZero);

		if(createjs.Ticker.getTicks() % 5 == 0) {
			this.rad = Math.atan2(
				target.position.y - this.position.y, 
				target.position.x - this.position.x
			);

			this.deg = Math.radToDeg(this.rad);

			this.force.x = this.velocity.x * trigTable.cos(this.deg);
			this.force.y = this.velocity.y * trigTable.sin(this.deg);
		}

		this.body.ApplyForce(this.force, worldCenter);

		this.base.play();
		this.base.rotation = this.deg + 90;
		 
		this.setPosition(this.body.GetPosition(), rad);

		this.turret.update(options);
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
EnemyTank.prototype.kill = function() {
	if(this.isAlive) {
		this.setIsAlive(false);

		this.container.getStage().removeChild(this.container);

		this.turret.fireCounter = 0;

		goog.events.dispatchEvent(this, this.enemyKilledEvent);
	}
};

EnemyTank.prototype.setPosition = function(pos) {
	var scale = app.physicsScale;

	this.physicalPosition = pos;

	this.container.x = (this.physicalPosition.x * scale) - this.turret.shape.x;
	this.container.y = (this.physicalPosition.y * scale) - this.turret.shape.y;

	this.position.x = this.container.x + this.turret.shape.x;
	this.position.y = this.container.y + this.turret.shape.y;

	//SET TANK AND TURRET BODY POSITIONS
	this.body.SetPositionAndAngle(pos, Math.degToRad(this.base.rotation));
	this.turretBody.SetPosition(this.physicalPosition);
};

EnemyTank.prototype.setIsAlive = function(value) {
	Enemy.prototype.setIsAlive.call(this, value);

	this.turretBody.SetAwake(value);
	this.turretBody.SetActive(value);
};

EnemyTank.prototype.setTurret = function() {
	var TurretClass = TurretClasses[this.turretType];

	this.turret = new TurretClass(this.color, this.projectileSystem, true);
	this.turret.shape.x = this.width * 0.5;
	this.turret.shape.y = this.height * 0.5;
	this.container.addChild(this.turret.shape);

	this.turret.fireThreshold = 180;
};

EnemyTank.prototype.setPhysics = function() {
	this.setBaseBody();
	this.setTurretBody();
};

EnemyTank.prototype.setBaseBody = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef(),
		scale = app.physicsScale * 2;
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 0;
	fixDef.filter.categoryBits = CollisionCategories.GROUND_ENEMY_BASE;
	fixDef.filter.maskBits = CollisionCategories.SCENE_OBJECT | CollisionCategories.PLAYER_BASE;
	fixDef.shape = new app.b2PolygonShape();
	fixDef.shape.SetAsBox(this.width / scale, this.height / scale);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetAwake(true);
	this.body.SetActive(true);
};

EnemyTank.prototype.setTurretBody = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef();
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = CollisionCategories.GROUND_ENEMY;
	fixDef.filter.maskBits = CollisionCategories.PLAYER_PROJECTILE;
	fixDef.isSensor = true;
	fixDef.shape = new app.b2CircleShape(1);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.turretBody = app.physicsWorld.CreateBody(bodyDef);
	this.turretBody.CreateFixture(fixDef);
	this.turretBody.SetUserData(this);
	this.turretBody.SetAwake(true);
	this.turretBody.SetActive(true);
};

goog.exportSymbol('EnemyTank', EnemyTank);