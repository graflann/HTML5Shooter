goog.provide('Mine');

goog.require('Projectile');

/**
*@constructor
*Ammo for Turret instances
*/
Mine = function(colors, categoryBits, maskBits, projectileSystem) {
	Projectile.call(this, colors, categoryBits, maskBits);

	this.projectileSystem = projectileSystem;

	this.velocityMod = 256;

	this.emissionMax = 8;

	this.emissionAngleIncrement = Math.round(360 / this.emissionMax);

	this.emissionAngleOffset = 0; //in rads

	this.explosionCounter = 0;

	this.explosionThreshold = createjs.Ticker.getFPS() * 1;
	
	this.init();
};

goog.inherits(Mine, Projectile)

/**
*@override
*@public
*/
Mine.prototype.init = function() {
	this.shape = new createjs.Shape();
	this.shape.graphics.ss(3).s(this.arrColors[0]).f(this.arrColors[1]).dc(0, 0, 6);
	this.shape.alpha = 0;
	this.shape.snapToPixel = true;
	this.shape.cache(-9, -9, 18, 18);
	
	this.setPhysics();

	Projectile.prototype.init.call(this);
};

/**
*@override
*@public
*/
Mine.prototype.update = function(options) {
	if(this.isAlive) {
		var scale = app.physicsScale;

		this.shape.x = this.body.GetWorldCenter().x * scale;
		this.shape.y = this.body.GetWorldCenter().y * scale;

		if(this.shape.alpha < 1) {
			this.shape.alpha += 0.15;
		}

		if(this.explosionCounter++ > this.explosionThreshold) {
			this.explode();
		}

		this.physicalPosition.x = this.position.x / app.physicalScale;
		this.physicalPosition.y = this.position.y / app.physicalScale;
	}
};

Mine.prototype.explode = function() {
	var deg,
		sin,
		cos,
		vector2D,
		stage = app.layers.getStage(LayerTypes.MAIN),
		projectile = null,
		i = -1;

	this.emissionAngleOffset = Math.randomInRangeWhole(0, this.emissionAngleIncrement);
	deg = this.emissionAngleOffset;

	while(++i < this.emissionMax) {
		projectile = this.projectileSystem.getProjectile();

		if(projectile) {
			vector2D = new app.b2Vec2();
			
			//zero out existing linear velocity
			projectile.body.SetLinearVelocity(vector2D);

			vector2D.x = (this.shape.x / app.physicsScale);
			vector2D.y = (this.shape.y / app.physicsScale);				
			projectile.body.SetPosition(vector2D);
			
			if(i > 0) {
				deg += this.emissionAngleIncrement;
				sin = app.trigTable.sin(deg);
				cos = app.trigTable.cos(deg);
			} else {
				sin = app.trigTable.sin(deg);
				cos = app.trigTable.cos(deg);
			}
			
			vector2D.x = cos * projectile.velocityMod;
			vector2D.y = sin * projectile.velocityMod;		
			projectile.body.ApplyForce(vector2D, projectile.body.GetWorldCenter());

			projectile.setIsAlive(true);
			
			stage.addChild(projectile.shape);
		}
	}

	// if(projectile) {
	// 	app.assetsProxy.playSound("shot1", 0.5);
	// }

	//removes the mine base
	this.kill();
};

/**
*@override
*@public
*/
Mine.prototype.clear = function() {
	Projectile.prototype.clear.call(this);

	this.projectileSystem = null;
};

Mine.prototype.kill = function() {
	if(this.isAlive) {
		this.setIsAlive(false);
		this.shape.getStage().removeChild(this.shape);

		this.shape.alpha = 0;

		this.explosionCounter = 0;
	}
};

/**
*@private
*/
Mine.prototype.setPhysics = function() {
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


