goog.provide('GrenadeParticle');

goog.require('Particle');

/**
*@constructor
*/
GrenadeParticle = function(color) {
	Particle.call(this, color);

	/**
	*physical body added to Box2D physicsWorld
	*@type {Box2D.Dynamics.b2Body}
	*/
	this.body;

	this.physicalPosition = new app.b2Vec2();

	this.damage = 1;
	
	this.init();
};

goog.inherits(GrenadeParticle, Particle)

/**
*@override
*@public
*/
GrenadeParticle.prototype.init = function() {
	this.shape = new createjs.Shape();
	this.shape.graphics.ss(0.5).s(this.color).f("#000").dc(0, 0, 3);

	this.shape.scaleX = this.shape.scaleY = Math.randomInRange(0.25, 3);

	this.setPhysics();

	this.setIsAlive(false);
};

/**
*@override
*@public
*/
GrenadeParticle.prototype.update = function(options) {
	if (this.isAlive) {
		this.position.x = this.shape.x += this.velocity.x;
		this.position.y = this.shape.y += this.velocity.y;

		this.shape.scaleX = this.shape.scaleY += 0.5;
		this.shape.alpha -= 0.05;

		if(this.shape.alpha < 0) {
			this.kill();
		}
	}
};

GrenadeParticle.prototype.clear = function() {
	Particle.prototype.clear.call(this);

	this.body.DestroyFixture(this.body.GetFixtureList());
	app.physicsWorld.DestroyBody(this.body);
	this.body = null;

	this.physicalPosition = null;
};

/**
*@override
*@public
*/
GrenadeParticle.prototype.create = function(options) {
	Particle.prototype.create.call(this, options);

	this.setIsAlive(true);

	this.physicalPosition.x = this.shape.x / app.physicsScale;
	this.physicalPosition.y = this.shape.y / app.physicsScale;
	this.body.SetPosition(this.physicalPosition);
};

/**
*@override
*@public
*/
GrenadeParticle.prototype.kill = function() {
	Particle.prototype.kill.call(this);

	this.shape.scaleX = this.shape.scaleY = Math.randomInRange(0.25, 3);

	this.shape.alpha = 1;

	this.setIsAlive(false);
};

GrenadeParticle.prototype.setIsAlive = function(value) {
	this.body.SetAwake(value);
	this.body.SetActive(value);
	this.isAlive = value;
};

/**
*@private
*/
GrenadeParticle.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef();
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = CollisionCategories.PLAYER_PROJECTILE;
	fixDef.filter.maskBits = CollisionCategories.GROUND_ENEMY | CollisionCategories.SCENE_OBJECT;
	fixDef.isSensor = true;
	fixDef.shape = new app.b2CircleShape(1.5);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetPosition(this.physicalPosition);
};
