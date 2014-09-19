goog.provide('VulcanProjectile');

goog.require('Projectile');

/**
*@constructor
*Ammo for Turret instances
*/
VulcanProjectile = function(arrColors, options) {
	Projectile.call(this, arrColors, options);

	/**
	*physical body added to Box2D physicsWorld
	*@type {}
	*/
	this.velocityMod = 192;
	
	this.init();
};

goog.inherits(VulcanProjectile, Projectile)

/**
*@override
*@public
*/
VulcanProjectile.prototype.init = function() {
	this.shape = new createjs.Shape();

	this.shape.graphics
		.ss(4, "round")
		.ls([this.arrColors[0], this.arrColors[1]], [0.5, 1], 0, 0, 0, 32)
		.mt(0, 0)
		.lt(0, 32);
		
	this.shape.alpha = 0;
	this.shape.snapToPixel = true;
	this.shape.cache(-4, 0, 4, 32);
	
	this.setPhysics();

	Projectile.prototype.init.call(this);
};

/**
*@override
*@public
*/
VulcanProjectile.prototype.update = function(options) {
	if(this.isAlive) {
		if(this.shape.alpha < 1) {
			this.shape.alpha += 0.15;
		}

		Projectile.prototype.update.call(this, options);
	}
};

/**
*@override
*@public
*/
VulcanProjectile.prototype.clear = function() {
	this.shape.uncache();

	Projectile.prototype.clear.call(this);
};

VulcanProjectile.prototype.kill = function() {
	if(this.isAlive) {
		this.setIsAlive(false);
		this.shape.getStage().removeChild(this.shape);

		this.shape.alpha = 0;
	}
};

/**
*@private
*/
VulcanProjectile.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef();
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = this.categoryBits;
	fixDef.filter.maskBits = this.maskBits;
	fixDef.isSensor = true;
	fixDef.shape = new app.b2CircleShape(0.125);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetBullet(true);
	this.body.SetPosition(this.physicalPosition);
};


