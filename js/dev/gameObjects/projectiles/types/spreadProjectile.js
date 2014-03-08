goog.provide('SpreadProjectile');

goog.require('Projectile');

/**
*@constructor
*Ammo for Turret instaces
*/
SpreadProjectile = function(colors, categoryBits, maskBits)
{
	Projectile.call(this, colors, categoryBits, maskBits);

	/**
	*physical body added to Box2D physicsWorld
	*@type {}
	*/
	this.velocityMod = 512;
	
	this.init();
};

goog.inherits(SpreadProjectile, Projectile)

/**
*@override
*@public
*/
SpreadProjectile.prototype.init = function(options)
{
	this.shape = new createjs.Shape();
	this.shape.graphics.ss(3).s(this.arrColors[0]).f(this.arrColors[1]).dc(0, 0, 6);
	this.shape.snapToPixel = true;
	this.shape.cache(-9, -9, 18, 18);
	
	this.setPhysics();

	Projectile.prototype.init.call(this);
};

/**
*@override
*@public
*/
SpreadProjectile.prototype.update = function()
{
	if(this.isAlive) {
		var scale = app.physicsScale;

		//this.shape.rotation = this.body.GetAngle() * (180 / Math.PI);
		this.shape.x = this.body.GetWorldCenter().x * scale;
		this.shape.y = this.body.GetWorldCenter().y * scale;

		Projectile.prototype.update.call(this);
	}
};

/**
*@private
*/
SpreadProjectile.prototype.setPhysics = function()
{
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef();
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = this.categoryBits;
	fixDef.filter.maskBits = this.maskBits;
	fixDef.isSensor = true;
	fixDef.shape = new app.b2CircleShape(0.25);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetBullet(true);
	this.body.SetPosition(this.physicalPosition);
};


