goog.provide('BladeProjectile');

goog.require('Projectile');

/**
*@constructor
*Ammo for Turret instaces
*/
BladeProjectile = function(colors, categoryBits, maskBits) {
	Projectile.call(this, colors, categoryBits, maskBits);

	/**
	*physical body added to Box2D physicsWorld
	*@type {}
	*/
	this.velocityMod = 1024;

	this.timer = 0;

	this.secondsAlive = 0.3;

	this.timerThreshold = createjs.Ticker.getFPS() * this.secondsAlive;
	
	this.init();
};

goog.inherits(BladeProjectile, Projectile);

/**
*@override
*@public
*/
BladeProjectile.prototype.init = function() {
	this.shape = new createjs.Shape();
	this.shape.graphics
		.ss(3, "butt")
		.s(this.arrColors[0])
		.mt(-8, 16)
		.lt(0, -32)
		.lt(8, 16);
	this.shape.alpha = 0;
	this.shape.regY = -16;
	this.shape.snapToPixel = true;
	this.shape.cache(-8, -32, 16, 48);

	this.timer = 0;
	
	this.setPhysics();

	Projectile.prototype.init.call(this);
};

/**
*@override
*@public
*/
BladeProjectile.prototype.update = function(options) {
	if(this.isAlive) {
		var scale = app.physicsScale;

		this.shape.x = this.body.GetWorldCenter().x * scale;
		this.shape.y = this.body.GetWorldCenter().y * scale;

		this.shape.alpha += 0.25;

		if(++this.timer > this.timerThreshold) {
			this.timer = 0;
			this.shape.alpha = 0;
			this.kill();
		}

		Projectile.prototype.update.call(this);
	}
};

/**
*@private
*/
BladeProjectile.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef();
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = this.categoryBits;
	fixDef.filter.maskBits = this.maskBits;
	fixDef.isSensor = true;
	fixDef.shape = new app.b2CircleShape(0.375);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetBullet(true);
	this.body.SetPosition(this.physicalPosition);
};


