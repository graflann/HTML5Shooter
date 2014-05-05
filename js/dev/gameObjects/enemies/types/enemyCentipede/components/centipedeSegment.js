goog.provide('CentipedeSegment');

goog.require('Enemy');


/**
*@constructor
*/
CentipedeSegment = function(physicalVelocity, projectileSystem, isTail) {
	Enemy.call(this);

	this.physicalVelocity = physicalVelocity;

	/**
	 * @type {ProjectileSystem}
	 */
	this.projectileSystem = projectileSystem;

	this.isTail = isTail || false;

	this.categoryBits = CollisionCategories.GROUND_ENEMY;

	this.maskBits = CollisionCategories.PLAYER_PROJECTILE | CollisionCategories.PLAYER_BASE;

	this.shape = null;

	this.offset = new app.b2Vec2();

	this.segmentAnchor = new app.b2Vec2();

	this.segmentAnchorDistance = 0;

	this.deg = 0;

	this.fireCounter = 0;
	this.fireThreshold = 30;

	this.init();
};

goog.inherits(CentipedeSegment, Enemy);


CentipedeSegment.ARR_FIRE_OFFSETS = [-16, 16];

CentipedeSegment.AMMO_DISTANCE = -(80 / Constants.PHYSICS_SCALE);

/**
*Ratio translating head physics velocity to pixels per tick
*/
CentipedeSegment.PHYSICAL_VELOCITY_MOD = Math.round(1000 / 1.77);

/**
*@override
*@public
*/
CentipedeSegment.prototype.init = function() {
	this.container = new createjs.Container();

	this.width = 128;
	this.height = 48;

	this.offset.x = -(this.width * 0.5);
	this.offset.y = -(this.height * 0.5);

	this.velocity.x = this.physicalVelocity.x / CentipedeSegment.PHYSICAL_VELOCITY_MOD;
	this.velocity.y = this.physicalVelocity.y / CentipedeSegment.PHYSICAL_VELOCITY_MOD;

	if(!this.isTail) {
		this.shape = new createjs.BitmapAnimation(app.assetsProxy.arrSpriteSheet["centipedeSegment"]);
		this.shape.gotoAndPlay(0);
	} else {
		this.shape = new createjs.BitmapAnimation(app.assetsProxy.arrSpriteSheet["centipedeTail"]);
		this.shape.gotoAndStop(0);
	}
	this.shape.regX = this.width * 0.5;
	this.shape.regY = this.height * 0.5;
	this.shape.rotation = 90;
	
	this.container.addChild(this.shape);

	this.segmentAnchorDistance = this.height * 0.375;

	this.setPhysics();

	this.setIsAlive(false);
};

/**
*@override
*@public
*/
CentipedeSegment.prototype.update = function(options) {
	if(this.isAlive) {
		var prevSegment = options.prevSegment,
			rad = 0,
			trigTable = app.trigTable;

		if(createjs.Ticker.getTicks() % 5 == 0) {
			rad = Math.atan2(
				prevSegment.segmentAnchor.y - this.position.y, 
				prevSegment.segmentAnchor.x - this.position.x 
			);

			this.deg = Math.radToDeg(rad);
		}

		this.container.x += (this.velocity.x * trigTable.cos(this.deg));
		this.container.y += (this.velocity.y * trigTable.sin(this.deg));

		this.setPosition(this.container.x, this.container.y);
		this.container.rotation = this.deg;

		this.segmentAnchor.x = this.position.x - 
			(this.segmentAnchorDistance * trigTable.cos(this.container.rotation));
		this.segmentAnchor.y = this.position.y - 
			(this.segmentAnchorDistance * trigTable.sin(this.container.rotation));
	}
};

/**
*@override
*@public
*/
CentipedeSegment.prototype.updateFire = function(options) {
	if(this.fireCounter++ > this.fireThreshold) {
		this.fire(options);
		this.fireCounter = 0;
	}
};

/**
*@override
*@public
*/
CentipedeSegment.prototype.clear = function() {
	Enemy.prototype.clear.call(this);

	this.physicalVelocity = null;

	this.projectileSystem = null;

	this.shape = null;

	this.offset = null;

	this.segmentAnchor = null;
};

/**
*@private
*/
CentipedeSegment.prototype.fire = function(options) {
	var target = options.target,
		deg,
		targetDeg,
		sin,
		cos,
		firingPosDeg,
		firingPosSin,
		firingPOsCos,
		vector2D = new app.b2Vec2(),
		trigTable = app.trigTable,
		stage = this.container.getStage(),
		projectile = null,
		i = -1,
		length = CentipedeSegment.ARR_FIRE_OFFSETS.length;

	//acquire rotation of Turret instance in degrees and add ammo at table-referenced distance	
	deg = this.container.rotation;
	targetDeg = Math.radToDeg(
		Math.atan2(
			target.y - this.position.y, 
			target.x - this.position.x
		)
	);
	sin = trigTable.sin(targetDeg);
	cos = trigTable.cos(targetDeg);

	//fires 2 parallel shots simultaneously
	while(++i < length) {
		projectile = this.projectileSystem.getProjectile();

		if(projectile) {			
			//zero out existing linear velocity
			projectile.body.SetLinearVelocity(app.vecZero);

			//acquire values to determine firing position
			firingPosDeg = (deg + CentipedeSegment.ARR_FIRE_OFFSETS[i]);
			firingPosSin = trigTable.sin(firingPosDeg);
			firingPosCos = trigTable.cos(firingPosDeg); 
			
			vector2D.x = (this.position.x / app.physicsScale) + (firingPosCos * CentipedeSegment.AMMO_DISTANCE);
			vector2D.y = (this.position.y / app.physicsScale) + (firingPosSin * CentipedeSegment.AMMO_DISTANCE);				
			projectile.body.SetPosition(vector2D);
			
			vector2D.x = cos * projectile.velocityMod;
			vector2D.y = sin * projectile.velocityMod;		
			projectile.body.ApplyForce(vector2D, projectile.body.GetWorldCenter());

			projectile.setIsAlive(true);
			
			//projectile.shape.rotation = this.container.rotation;
			stage.addChild(projectile.shape);
		}
	}
};

/**
*@private
*/
CentipedeSegment.prototype.setPosition = function(x, y) {
	this.position.x = this.container.x = x;
	this.position.y = this.container.y = y;

	this.physicalPosition.x = this.position.x / app.physicsScale;
	this.physicalPosition.y = this.position.y / app.physicsScale;
	
	this.body.SetPositionAndAngle(this.physicalPosition, Math.degToRad(this.container.rotation));
};

CentipedeSegment.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef(),
		scale = app.physicsScale,
		w = (this.width * 0.25) / scale,
		h = (this.height * 0.5) / scale;
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = this.categoryBits;
	fixDef.filter.maskBits = this.maskBits;
	fixDef.isSensor = true;
	fixDef.shape = new app.b2PolygonShape();
	fixDef.shape.SetAsBox(w,  h);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetAwake(true);
};

/**
*@public
*/
CentipedeSegment.prototype.onCollide = function(collisionObject, options) {

	if(collisionObject instanceof Projectile) {
		Enemy.prototype.onCollide.call(this, collisionObject, options);
		return;
	}

	// if(collisionObject instanceof PlayerTank) {
	// 	goog.events.dispatchEvent(this, this.collisionEvent);
	// }
};

goog.exportSymbol('CentipedeSegment', CentipedeSegment);