goog.provide('EnemyDrone');

goog.require('Enemy');


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

	this.shape = null;

	this.homingRate = 15;

	this.init();
};

goog.inherits(EnemyDrone, Enemy);

/**
*@override
*@public
*/
EnemyDrone.prototype.init = function() {
	var radius = 0;

	this.container = new createjs.Container();

	this.width = 32;
	this.height = 32;

	radius = (this.width * 0.5);

	this.velocityMod = 1;

	this.shape = new createjs.Shape();
	this.shape.graphics
		.ss(2)
		.s(Constants.RED)
		.f(Constants.YELLOW)
		.dc(0, 0, radius);
	this.shape.snapToPixel = true;

	radius += 4;
	this.shape.cache(-radius, -radius, radius * 2, radius * 2);
	
	this.container.addChild(this.shape);

	this.setPhysics();

	this.setIsAlive(false);
};

/**
*@override
*@public
*/
EnemyDrone.prototype.update = function(options) {

	if(this.isAlive) {
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
		}

		this.container.x += this.velocity.x;
		this.container.y += this.velocity.y;

		this.setPosition(this.container.x, this.container.y);

		this.physicalPosition.x = this.position.x / app.physicsScale;
		this.physicalPosition.y = this.position.y / app.physicsScale;

		this.body.SetPosition(this.physicalPosition);
	}
};

/**
*@override
*@public
*/
EnemyDrone.prototype.clear = function() {
	
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