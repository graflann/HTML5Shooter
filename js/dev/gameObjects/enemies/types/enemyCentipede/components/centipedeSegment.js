goog.provide('CentipedeSegment');

goog.require('Enemy');


/**
*@constructor
*/
CentipedeSegment = function(physicalVelocity, projectileSystem, isTail) {
	Enemy.call(this);

	this.physicalVelocity = physicalVelocity;

	/**
	 * @type {Array}
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

	//Ratio translating head physics velocity to pixels per tick
	this.physicalVelocityMod = Math.round(1000 / 1.77);

	this.turret = null;

	this.init();
};

goog.inherits(CentipedeSegment, Enemy);

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

	this.velocity.x = this.physicalVelocity.x / this.physicalVelocityMod;
	this.velocity.y = this.physicalVelocity.y / this.physicalVelocityMod;

	if(!this.isTail) {
		this.shape = new createjs.BitmapAnimation(app.assetsProxy.arrSpriteSheet["centipedeSegment"]);
		this.shape.gotoAndPlay(0);
	} else {
		this.shape = new createjs.BitmapAnimation(app.assetsProxy.arrSpriteSheet["centipedeTail"]);
		this.shape.gotoAndStop(0);

		this.turret = new EnemyVulcanTurret(Constants.RED, this.projectileSystem, true);
		this.turret.shape.x = -this.height * 0.5;

		this.turret.fireCounter = 0;
		this.turret.fireThreshold = 30;
	}
	this.shape.regX = this.width * 0.5;
	this.shape.regY = this.height * 0.5;
	this.shape.rotation = 90;
	
	this.container.addChild(this.shape);

	//add turret to tail
	if(this.turret) {
		this.container.addChild(this.turret.shape);
	}

	this.segmentAnchorDistance = this.height * 0.375;

	this.setPhysics();

	this.setIsAlive(false);
};

/**
*@override
*@public
*/
CentipedeSegment.prototype.update = function(options) {
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

	if(this.turret) {
		this.turret.update(options);

		//offset turret rotation relative to parent
		this.turret.shape.rotation -= this.deg; 
	}
};

/**
*@override
*@public
*/
CentipedeSegment.prototype.clear = function() {
	
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