goog.provide('LaserProjectile');

goog.require('Projectile');

/**
*@constructor
*Ammo for Turret instaces
*/
LaserProjectile = function(arrColors, options) {
	Projectile.call(this, arrColors, options);

	/**
	*physical body added to Box2D physicsWorld
	*@type {}
	*/
	this.velocityMod = 1536;
	
	
	this.init();
};

goog.inherits(LaserProjectile, Projectile)

/**
*@override
*@public
*/
LaserProjectile.prototype.init = function() {	
	this.shape = new createjs.Shape();
	//this.shape.graphics.ss(2).s(this.color).f("#000").dc(0, 0, 5);

	this.shape.graphics
		.ss(2, "round")
		.ls([this.arrColors[0], this.arrColors[1]], [0.5, 1], 0, 0, 0, 96)
		.mt(0, 0)
		.lt(0, 96);
	this.shape.alpha = 0;
	this.shape.snapToPixel = true;
	this.shape.cache(-1, 0, 8, 96);

	this.damage = 1;
	
	this.setPhysics();

	Projectile.prototype.init.call(this);
};

/**
*@override
*@public
*/
LaserProjectile.prototype.update = function(options) {
	if(this.isAlive) {

		if(this.shape.alpha < 1) {
			this.shape.alpha += 0.1;
		}

		Projectile.prototype.update.call(this, options);
	}
};

/**
*@override
*@public
*/
LaserProjectile.prototype.clear = function() {
	this.shape.uncache();

	Projectile.prototype.clear.call(this);
};

LaserProjectile.prototype.kill = function() {
	if(this.isAlive) {
		this.setIsAlive(false);
		this.shape.getStage().removeChild(this.shape);

		this.shape.alpha = 0;
	}
};

/**
*@private
*/
LaserProjectile.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef();
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = this.categoryBits;
	fixDef.filter.maskBits = this.maskBits;
	fixDef.isSensor = true;
	fixDef.shape = new app.b2CircleShape(0.175);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetBullet(true);
	this.body.SetPosition(this.physicalPosition);
};


