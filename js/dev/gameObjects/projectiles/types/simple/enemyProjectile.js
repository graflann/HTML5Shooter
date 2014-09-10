goog.provide('EnemyProjectile');

goog.require('Projectile');

/**
*@constructor
*Ammo for Enemy instances
*/
EnemyProjectile = function(arrColors, options) {
	Projectile.call(this, arrColors, options);

	/**
	*physical body added to Box2D physicsWorld
	*@type {}
	*/
	this.velocityMod = 32;
	
	this.init();
};

goog.inherits(EnemyProjectile, Projectile)

/**
*@override
*@public
*/
EnemyProjectile.prototype.init = function() {
	this.shape = new createjs.Shape();
	this.shape.graphics.ss(2).s(this.arrColors[0]).f("#000").dc(0, 0, 3);
	this.shape.alpha = 0;
	this.shape.snapToPixel = true;
	this.shape.cache(-4, -4, 8, 8);
	
	this.setPhysics();

	Projectile.prototype.init.call(this);
};

/**
*@override
*@public
*/
EnemyProjectile.prototype.update = function(options) {
	if(this.isAlive) {
		var scale = app.physicsScale;

		this.shape.x = this.body.GetWorldCenter().x * scale;
		this.shape.y = this.body.GetWorldCenter().y * scale;

		if(this.shape.alpha < 1) {
			this.shape.alpha += 0.15;
		}

		Projectile.prototype.update.call(this);
	}
};

/**
*@override
*@public
*/
EnemyProjectile.prototype.clear = function() {
	this.shape.uncache();
	
	Projectile.prototype.clear.call(this);
};

EnemyProjectile.prototype.kill = function() {
	if(this.isAlive) {
		this.setIsAlive(false);
		this.shape.getStage().removeChild(this.shape);

		this.shape.alpha = 0;
	}
};

/**
*@private
*/
EnemyProjectile.prototype.setPhysics = function() {
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


