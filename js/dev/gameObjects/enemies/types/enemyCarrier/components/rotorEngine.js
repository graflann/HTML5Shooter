goog.provide('RotorEngine');

goog.require('Rotor');
goog.require('PayloadEvent');

/**
*Rotor with dynamic body to sense collision
*@constructor
*/
RotorEngine = function(color, radius, thickness, parentGameObject) {
	this.parentGameObject = parentGameObject;

	this.isAlive = null;

	this.body = null;

	this.health = 0;

	this.reticle = null;

	this.physicalPosition = new app.b2Vec2();

	this.physicalOffset = new app.b2Vec2();

	this.distanceOffset = 0;

	this.angleOffset = 0;

	this.componentDestroyedEvent = new PayloadEvent(EventNames.COMPONENT_DESTROYED, null);

	Rotor.call(this, color, radius, thickness);
};

goog.inherits(RotorEngine, Rotor);

/**
*@private
*/
RotorEngine.prototype.init = function() {
	Rotor.prototype.init.call(this);

	this.setPhysics();

	this.isAlive = true;
};

/**
*@public
*/
RotorEngine.prototype.update = function(options) {
	if(this.isAlive) {
		Rotor.prototype.update.call(this, options);

		if(this.reticle) {
			this.reticle.shape.x = this.position.x;
			this.reticle.shape.y = this.position.y;
		}	
	}
};

/**
*@public
*/
RotorEngine.prototype.clear = function() {
	Rotor.prototype.clear.call(this);

	if(this.body) {
		this.body.SetAwake(false);
		this.body.SetUserData(null);
		this.body.DestroyFixture(this.body.GetFixtureList());
		app.physicsWorld.DestroyBody(this.body);
		this.body = null;
	}

	this.reticle = null;

	this.bodyUserData = null;

	this.physicalPosition = null;
	this.physicalOffset = null;

	this.componentDestroyedEvent = null;
};

RotorEngine.prototype.setIsAlive = function(value) {
	this.isAlive = value;

	this.body.SetActive(value);
	this.body.SetAwake(value);
};


RotorEngine.prototype.kill = function() {
	if(this.isAlive) {
		this.setIsAlive(false);
	}
};

RotorEngine.prototype.setPositionAndAngle = function(position, angle) {
	var table = app.trigTable,
		currentAngle = angle + this.angleOffset;

	this.physicalPosition.x = position.x + (this.distanceOffset * table.cos(currentAngle));
	this.physicalPosition.y = position.y + (this.distanceOffset * table.sin(currentAngle));

	this.position.x = this.physicalPosition.x * app.physicsScale;
	this.position.y = this.physicalPosition.y * app.physicsScale;

	this.body.SetPosition(this.physicalPosition);
};

/**
*@public
*/
RotorEngine.prototype.modifyHealth = function(value) {
	this.health -= value;

	if(this.health <= 0) {
		this.health = 0;
	}

	return this.health;
};

RotorEngine.prototype.getParentGameObject = function () {
	return this.parentGameObject;
};

/**
*@public
*/
RotorEngine.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef();
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = CollisionCategories.AIR_ENEMY;
	fixDef.filter.maskBits = CollisionCategories.HOMING_PROJECTILE | CollisionCategories.HOMING_OVERLAY;
	fixDef.isSensor = true;
	fixDef.shape = new app.b2CircleShape(1);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetAwake(false);
};

/**
*@public
*/
RotorEngine.prototype.onHoming = function(homingObject, options) {
	if(this.health > 0 && !this.reticle) {
		options.reticles.emit(1, {
			posX: this.position.x,
			posY: this.position.y
		});

		this.reticle = options.reticles.getLastAlive();
	}
};

RotorEngine.prototype.onCollide = function(collisionObject, options) {

	if(this.modifyHealth(collisionObject.damage) === 0) {
		options.explosions.emit(8, {
			posX: this.position.x,
			posY: this.position.y,
			posOffsetX: 8,
			posOffsetY: 8,
			velX: 3,
			velY: 3
		});

		this.componentDestroyedEvent.payload = options;
		goog.events.dispatchEvent(this, this.componentDestroyedEvent);
	}
};
