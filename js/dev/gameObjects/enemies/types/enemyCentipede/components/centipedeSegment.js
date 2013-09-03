goog.provide('CentipedeSegment');

goog.require('Enemy');


/**
*@constructor
*/
CentipedeSegment = function(physicalVelocity, projectileSystem) {
	Enemy.call(this);

	this.physicalVelocity = physicalVelocity;

	/**
	 * @type {Array}
	 */
	this.projectileSystem = projectileSystem;

	this.categoryBits = CollisionCategories.GROUND_ENEMY;

	this.maskBits = CollisionCategories.PLAYER_PROJECTILE | CollisionCategories.PLAYER_BASE;

	this.shape = null;

	this.offset = new app.b2Vec2();

	this.segmentAnchor = new app.b2Vec2();

	this.segmentAnchorDistance = 0;

	this.deg = 0;

	this.physicalVelocityMod = Math.round(1000 / 1.77);

	this.init();
};

goog.inherits(CentipedeSegment, Enemy);

/**
*@override
*@public
*/
CentipedeSegment.prototype.init = function() {
	this.container = new createjs.Container();

	this.width = 64;
	this.height = 48;

	this.offset.x = -(this.width * 0.5);
	this.offset.y = -(this.height * 0.5);

	this.velocity.x = this.physicalVelocity.x / this.physicalVelocityMod;
	this.velocity.y = this.physicalVelocity.y / this.physicalVelocityMod;

	this.shape = new createjs.Shape();
	this.shape.graphics
		.ss(2)
		.s(Constants.RED)
		.f(Constants.BLACK)
		.dr(0, 0, this.width, this.height);
	this.shape.snapToPixel = true;
	this.shape.regX = this.width * 0.5;
	this.shape.regY = this.height * 0.5;
	this.shape.cache(0, 0, this.width, this.height);
	
	this.container.addChild(this.shape);

	this.segmentAnchorDistance = this.width * 0.5;

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
		w = (this.width * 0.5) / scale,
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

goog.exportSymbol('CentipedeSegment', CentipedeSegment);