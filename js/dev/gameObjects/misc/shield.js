goog.provide('Shield');

goog.require('GameObject');
goog.require('CollisionCategories');

/**
*@constructor
*/
Shield = function(arrColors, radius, thickness) {
	GameObject.call(this);
	
	this.arrColors = arrColors;

	this.radius = radius;

	this.thickness = thickness || 2;

	this.container = null;

	this.shape = null;

	this.body = null;

	this.physicalPosition = new app.b2Vec2();

	this.categoryBits = CollisionCategories.SHIELD;

	this.maskBits = CollisionCategories.PLAYER_PROJECTILE;

	this.isAlive = false;
	
	this.init();
};

goog.inherits(Shield, GameObject);

/**
*@private
*/
Shield.prototype.init = function() {
	this.container = new createjs.Container();
	this.container.alpha = 0.5;

	this.render();
	this.setPhysics();

	this.collisionRoutingObject = new CollisionRoutingObject();
	this.collisionRoutingObject.type = "shield";

	this.setIsAlive(false);
};

/**
*@public
*/
Shield.prototype.update = function(options) {
	if(this.isAlive) {
		var target = options.target;

		this.setPosition(target.position.x, target.position.y);
	}
};

Shield.prototype.setIsAlive = function(value) {
	this.body.SetAwake(value);
	this.body.SetActive(value);
	this.isAlive = value;
};

/**
*@private
*/
Shield.prototype.setPosition = function(x, y) {
	this.position.x = this.container.x = x;
	this.position.y = this.container.y = y;

	this.physicalPosition.x = this.position.x / app.physicsScale;
	this.physicalPosition.y = this.position.y / app.physicsScale;
	
	this.body.SetPosition(this.physicalPosition);
};

/**
*@public
*/
Shield.prototype.clear = function() {
	GameObject.prototype.clear.call(this);

	if(this.container) {
		//this.container.uncache();
		this.container.removeAllChildren();
		this.container = null;
	}

	this.shape.graphics.clear();
	this.shape = null;

	if(this.body) {
		this.body.SetAwake(false);
		this.body.SetUserData(null);
		this.body.DestroyFixture(this.body.GetFixtureList());
		app.physicsWorld.DestroyBody(this.body);
		this.body = null;
	}

	this.physicalPosition = null;

	this.categoryBits = null;

	this.maskBits = null;
};

/**
*A gradient circle fill displaying the shield
*@private
*/
Shield.prototype.render = function() {
	var diameter = this.radius * 2,
		cacheRadius = this.radius + this.thickness,
		cacheDiameter = cacheRadius * 2;

	this.shape = new createjs.Shape();
	this.shape.graphics
		.ss(this.thickness)
		.s(this.arrColors[2])
		.rf([this.arrColors[0], this.arrColors[1]], [0, 1], 0, 0, this.radius * 0.25, 0, 0, this.radius)
		.dc(0, 0, this.radius);

	this.shape.snapToPixel = true;

	//cache dims include stroke thickness or the image is inappropriately cropped
	this.container.addChild(this.shape);
	//this.container.cache(-cacheRadius, -cacheRadius, cacheDiameter, cacheDiameter);
};

Shield.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef(),
		diameter = (this.radius * 2) / app.physicsScale;
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = this.categoryBits;
	fixDef.filter.maskBits = this.maskBits;
	fixDef.isSensor = true;
	fixDef.shape = new app.b2CircleShape(diameter);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetAwake(true);
};
