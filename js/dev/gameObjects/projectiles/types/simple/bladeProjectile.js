goog.provide('BladeProjectile');

goog.require('Projectile');

/**
*@constructor
*Ammo for Turret instaces
*/
BladeProjectile = function(arrColors, options) {
	Projectile.call(this, arrColors, options);

	this.dimension = options.dimension || 32;

	this.secondsAlive = options.secondsAlive || 0.3;

	/**
	*physical body added to Box2D physicsWorld
	*@type {}
	*/
	this.velocityMod = 1024;

	this.timer = 0;

	this.timerThreshold = createjs.Ticker.getFPS() * this.secondsAlive;
	
	this.init();
};

goog.inherits(BladeProjectile, Projectile);

/**
*@override
*@public
*/
BladeProjectile.prototype.init = function() {
	var mt1 = new app.b2Vec2(-(this.dimension * 0.25), this.dimension * 0.5),
		lt1 = new app.b2Vec2(0, -this.dimension),
		lt2 = new app.b2Vec2(this.dimension * 0.25, this.dimension * 0.5);

	this.shape = new createjs.Shape();
	this.shape.graphics
		.ss(3, "butt")
		.s(this.arrColors[0])
		.mt(mt1.x, mt1.y)
		.lt(lt1.x, lt1.y)
		.lt(lt2.x, lt2.y);
	this.shape.alpha = 0;
	this.shape.regY = -(this.dimension * 0.5);
	this.shape.snapToPixel = true;
	this.shape.cache(mt1.x, lt1.y, mt1.y, (this.dimension + mt1.y));

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

		this.shape.alpha += 0.25;

		if(++this.timer > this.timerThreshold) {
			this.timer = 0;
			this.shape.alpha = 0;
			this.kill();
		}

		Projectile.prototype.update.call(this, options);
	}
};

/**
*@override
*@public
*/
BladeProjectile.prototype.clear = function() {
	this.shape.uncache();

	Projectile.prototype.clear.call(this);
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


