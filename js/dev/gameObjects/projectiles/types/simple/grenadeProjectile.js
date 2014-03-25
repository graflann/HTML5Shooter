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
	//this.shape.graphics.ss(2).s(this.color).f("#000").dc(0, 0, 2);
	this.shape.graphics
		.ss(4, "round")
		.ls([this.arrColors[0], this.arrColors[1]], [0.5, 1], 0, 0, 0, 32)
		.mt(0, 0)
		.lt(0, 32);
		
	this.shape.alpha = 0;
	this.shape.snapToPixel = true;
	this.shape.cache(-2, 0, 2, 32);
	
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

		this.shape.x = this.body.GetWorldCenter().x * scale;
		this.shape.y = this.body.GetWorldCenter().y * scale;

		if(this.shape.alpha < 1) {
			this.shape.alpha += 0.15;
		}

		Projectile.prototype.update.call(this);
	}
};

GrenadeProjectile.prototype.kill = function() {
	if(this.isAlive) {
		this.setIsAlive(false);
		this.shape.getStage().removeChild(this.shape);

		this.shape.alpha = 0;
	}
};

/**
*@private
*/
GrenadeProjectile.prototype.setPhysics = function() {
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

/**
*@override
*@public
*/
GrenadeProjectile.prototype.onCollide = function(collisionObject, options) {

	if(collisionObject instanceof Enemy || collisionObject instanceof PlayerTank) {
		options.positiveHit.emit(1, {
			posX: this.shape.x,
			posY: this.shape.y,
			posOffsetX: 0,
			posOffsetY: 0,
			velX: 0,
			velY: 0
		});
	} else {
		options.neutralHit.emit(1, {
			posX: this.shape.x,
			posY: this.shape.y,
			posOffsetX: 0,
			posOffsetY: 0,
			velX: 0,
			velY: 0
		});
	}

	//push a GrenadeParticle on the CollisionManager.activationList for emission during update
	options.activationList.push(
        {
            system: options.grenade,
            qty: 1,
            posX: this.shape.x, 
            posY: this.shape.y
        }
    );
};


