goog.provide('GrenadeProjectile');

goog.require('Projectile');

/**
*@constructor
*Ammo for Turret instaces
*/
GrenadeProjectile = function(colors, categoryBits, maskBits)
{
	Projectile.call(this, colors, categoryBits, maskBits);

	/**
	*physical body added to Box2D physicsWorld
	*@type {}
	*/
	this.velocityMod = 192;
	
	
	this.init();
};

goog.inherits(GrenadeProjectile, Projectile)

/**
*@override
*@public
*/
GrenadeProjectile.prototype.init = function()
{	
	this.shape = new createjs.Shape();
	this.shape.graphics.ss(2).s(this.arrColors[0]).f("#000").dc(0, 0, 2);
	
	this.setPhysics();

	Projectile.prototype.init.call(this);
};

/**
*@override
*@public
*/
GrenadeProjectile.prototype.update = function(options)
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
GrenadeProjectile.prototype.setPhysics = function()
{
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef();
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = this.categoryBits;
	fixDef.filter.maskBits = this.maskBits;
	fixDef.shape = new app.b2CircleShape(0.5);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetBullet(true);
	this.body.SetPosition(this.physicalPosition);
};


