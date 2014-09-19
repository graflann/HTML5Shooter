goog.provide('SniperProjectile');

goog.require('Projectile');

/**
*@constructor
*Ammo for Turret instaces
*/
SniperProjectile = function(arrColors, options) {
	Projectile.call(this, arrColors, options);

	/**
	*physical body added to Box2D physicsWorld
	*@type {}
	*/
	this.velocityMod = 3200;
	
	this.init();
};

goog.inherits(SniperProjectile, Projectile)

/**
*@override
*@public
*/
SniperProjectile.prototype.init = function() {	
	this.shape = new createjs.Shape();

	this.shape.graphics
		.ss(8, "round")
		.ls([this.arrColors[0], this.arrColors[1]], [0.5, 1], 0, 0, 0, 192)
		.mt(0, 0)
		.lt(0, 192);
	this.shape.snapToPixel = true;
	this.shape.cache(-4, 0, 8, 192);

	this.shape.scaleX = 0.1;

	this.damage = 4;
	
	this.setPhysics();

	Projectile.prototype.init.call(this);
};

/**
*@override
*@public
*/
SniperProjectile.prototype.update = function(options) {
	if(this.isAlive) {

		if(this.shape.scaleX < 1) {
			this.shape.scaleX += 0.05;
		}

		Projectile.prototype.update.call(this, options);
	}
};

/**
*@override
*@public
*/
SniperProjectile.prototype.clear = function() {
	this.shape.uncache();

	Projectile.prototype.clear.call(this);
};

SniperProjectile.prototype.kill = function() {
	if(this.isAlive) {
		this.setIsAlive(false);
		this.shape.getStage().removeChild(this.shape);

		this.shape.scaleX = 0.1;
	}
};

/**
*@private
*/
SniperProjectile.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef();
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = this.categoryBits;
	fixDef.filter.maskBits = this.maskBits;
	fixDef.isSensor = true;
	fixDef.shape = new app.b2CircleShape(0.35);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetBullet(true);
	this.body.SetPosition(this.physicalPosition);
};


