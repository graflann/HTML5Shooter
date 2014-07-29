goog.provide('ReflectProjectile');

goog.require('Projectile');

/**
*@constructor
*Ammo for Turret instaces
*/
ReflectProjectile = function(arrColors, options) {
	Projectile.call(this, arrColors, options);

	/**
	*physical body added to Box2D physicsWorld
	*@type {}
	*/
	this.velocityMod = 512;

	this.secondsAlive = 1;

	this.timerThreshold = createjs.Ticker.getFPS() * this.secondsAlive;

	this.alphaTimer = 0;

	this.alphaTimerThreshold =  this.timerThreshold * 0.75;

	this.alphaDecrement = (this.timerThreshold - this.alphaTimerThreshold) / createjs.Ticker.getFPS();

	this.damageTimer = 0;

	this.damageTimerThreshold = this.timerThreshold * 0.5;
	
	this.damageDecrement = 0;
	
	this.init();
};

goog.inherits(ReflectProjectile, Projectile)

/**
*@override
*@public
*/
ReflectProjectile.prototype.init = function(options) {
	this.shape = new createjs.Shape();
	this.shape.graphics
		.ss(1)
		.s(this.arrColors[2])
		.rf([this.arrColors[1], this.arrColors[0]], [0, 1], 0, 0, 2, 0, 0, 6)
		.dc(0, 0, 6);

	this.shape.snapToPixel = true;

	this.alphaTimer = 0;

	//spread shots go with 2x damage, reduced over time, to a default of 1 set by the damage threshold
	this.damage = 2;
	this.damageDecrement = (this.damage - 1) / this.damageTimerThreshold;
	
	this.setPhysics();

	Projectile.prototype.init.call(this);
};

/**
*@override
*@public
*/
ReflectProjectile.prototype.update = function() {
	if(this.isAlive) {
		var scale = app.physicsScale;

		//this.shape.rotation = this.body.GetAngle() * (180 / Math.PI);
		this.shape.x = this.body.GetWorldCenter().x * scale;
		this.shape.y = this.body.GetWorldCenter().y * scale;

		if(++this.alphaTimer > this.alphaTimerThreshold) {
			this.shape.alpha -= this.alphaDecrement;

			if(this.shape.alpha <= 0) {
				this.alphaTimer = 0;
				this.kill();
			}
		}

		//shots power gradually decreases to a threshold until
		if(this.damageTimer++ < this.damageTimerThreshold) {
			this.damage -= this.damageDecrement;
		}

		Projectile.prototype.update.call(this);
	}
};

ReflectProjectile.prototype.setIsAlive = function(value) {
	Projectile.prototype.setIsAlive.call(this, value);

	//reset alpha
	this.shape.alpha = 1;
	this.alphaTimer = 0;

	//reset damage
	this.damage = 2;
	this.damageTimer = 0;
};

/**
*@private
*/
ReflectProjectile.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef();
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = this.categoryBits;
	fixDef.filter.maskBits = this.maskBits;
	fixDef.shape = new app.b2CircleShape(0.25);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetBullet(true);
	this.body.SetPosition(this.physicalPosition);
};


