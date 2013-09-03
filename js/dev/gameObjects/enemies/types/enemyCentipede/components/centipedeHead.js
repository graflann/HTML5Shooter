goog.provide('CentipedeHead');

goog.require('Enemy');


/**
*@constructor
*/
CentipedeHead = function() {
	Enemy.call(this);

	this.categoryBits = CollisionCategories.GROUND_ENEMY;

	this.maskBits = 
		CollisionCategories.PLAYER_PROJECTILE | CollisionCategories.PLAYER_BASE | CollisionCategories.SCENE_OBJECT;

	this.shape = null;

	this.force = new app.b2Vec2();

	this.deg = 0;

	this.segmentAnchor = new app.b2Vec2();

	this.segmentAnchorDistance = 0;

	this.init();
};

goog.inherits(CentipedeHead, Enemy);

/**
*@override
*@public
*/
CentipedeHead.prototype.init = function() {
	var radius = 0;

	this.container = new createjs.Container();

	this.width = 32;
	this.height = 32;

	this.velocity.x = 1500;
	this.velocity.y = 1500;

	radius = (this.width * 0.5);

	this.shape = new createjs.Shape();
	this.shape.graphics
		.ss(2)
		.s(Constants.RED)
		.f(Constants.BLACK)
		.mt(0, 0)
		.lt(0, -radius)
		.mt(0, 0)
		.lt(0, radius)
		.mt(0, 0)
		.dc(0, 0, radius);
	this.shape.snapToPixel = true;
	radius += 4;
	this.shape.cache(-radius, -radius, radius * 2, radius * 2);

	this.segmentAnchorDistance = radius;
	
	this.container.addChild(this.shape);

	this.setPhysics();

	this.setIsAlive(false);
};

/**
*@override
*@public
*/
CentipedeHead.prototype.update = function(options) {
	var target = options.target,
		trigTable = app.trigTable,
		worldCenter = this.body.GetWorldCenter(),
		rad = 0;

	//zero out any linear velocity
	this.body.SetLinearVelocity(app.vecZero);

	if(createjs.Ticker.getTicks() % 5 == 0) {
		rad = Math.atan2(
			target.position.y - this.position.y, 
			target.position.x - this.position.x
		);

		this.deg = Math.radToDeg(rad);

		this.force.x = this.velocity.x * trigTable.cos(this.deg);
		this.force.y = this.velocity.y * trigTable.sin(this.deg);
	}

	this.body.ApplyForce(this.force, worldCenter);

	//this.head.play();
	this.container.rotation = this.deg;
	 
	this.setPosition(this.body.GetPosition());
};

/**
*@override
*@public
*/
CentipedeHead.prototype.clear = function() {
	
};

/**
*@private
*/
CentipedeHead.prototype.setPosition = function(pos) {
	var scale = app.physicsScale,
		trigTable = app.trigTable;

	this.physicalPosition = pos;

	this.position.x = this.container.x = (this.physicalPosition.x * scale);
	this.position.y = this.container.y = (this.physicalPosition.y * scale);

	//SET TANK AND TURRET BODY POSITIONS
	this.body.SetPositionAndAngle(pos, Math.degToRad(this.container.rotation));

	this.segmentAnchor.x = this.position.x - 
		(this.segmentAnchorDistance * trigTable.cos(this.deg));
	this.segmentAnchor.y = this.position.y - 
		(this.segmentAnchorDistance * trigTable.sin(this.deg));
};

CentipedeHead.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef();
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = this.categoryBits;
	fixDef.filter.maskBits = this.maskBits;
	fixDef.shape = new app.b2CircleShape(1);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetAwake(true);
};

goog.exportSymbol('CentipedeHead', CentipedeHead);