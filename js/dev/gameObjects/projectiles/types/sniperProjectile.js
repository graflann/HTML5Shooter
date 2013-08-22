goog.provide('SniperProjectile');

goog.require('Projectile');

/**
*@constructor
*Ammo for Turret instaces
*/
SniperProjectile = function(colors, categoryBits, maskBits)
{
	Projectile.call(this, colors, categoryBits, maskBits);

	/**
	*physical body added to Box2D physicsWorld
	*@type {}
	*/
	this.velocityMod = 1024;
	
	
	this.init();
};

goog.inherits(SniperProjectile, Projectile)

/**
*@override
*@public
*/
SniperProjectile.prototype.init = function()
{	
	this.shape = new createjs.Shape();
	//this.shape.graphics.ss(2).s(this.color).f("#000").dc(0, 0, 5);

	this.shape.graphics
		.ss(8, "round")
		.ls([this.arrColors[0], this.arrColors[1]], [0.5, 1], 0, 0, 0, 96)
		.mt(0, 0)
		.lt(0, 96);

	this.shape.alpha = 0;
	
	this.setPhysics();

	Projectile.prototype.init.call(this);
};

/**
*@override
*@public
*/
SniperProjectile.prototype.update = function(options)
{
	if(this.isAlive) {
		var scale = app.physicsScale;

		//this.shape.rotation = this.body.GetAngle() * (180 / Math.PI);
		this.shape.x = this.body.GetWorldCenter().x * scale;
		this.shape.y = this.body.GetWorldCenter().y * scale;

		if(this.shape.alpha < 1) {
			this.shape.alpha += 0.1;
		}

		Projectile.prototype.update.call(this);
	}
};

SniperProjectile.prototype.kill = function() {
	if(this.isAlive) {
		this.setIsAlive(false);
		this.shape.getStage().removeChild(this.shape);

		this.shape.alpha = 0;
	}
};

/**
*@private
*/
SniperProjectile.prototype.setPhysics = function()
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


