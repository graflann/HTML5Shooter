goog.provide('CentipedeSegment');

goog.require('Enemy');


/**
*@constructor
*/
CentipedeSegment = function(projectileSystem) {
	Enemy.call(this);

	/**
	 * @type {Array}
	 */
	this.projectileSystem = projectileSystem;

	this.categoryBits = CollisionCategories.GROUND_ENEMY;

	this.maskBits = CollisionCategories.PLAYER_PROJECTILE | CollisionCategories.PLAYER_BASE;

	this.shape = null;

	this.offset = new app.b2Vec2();

	this.init();
};

goog.inherits(CentipedeSegment, Enemy);

/**
*@override
*@public
*/
CentipedeSegment.prototype.init = function() {
	this.container = new createjs.Container();

	this.width = 32;
	this.height = 32;

	this.offset.x = -(this.width * 0.5);
	this.offset.y = -(this.height * 0.5);

	this.shape = new createjs.Shape();
	this.shape.graphics
		.ss(2)
		.s(Constants.RED)
		.f(Constants.BLACK)
		.dr(0, 0, this.width, this.height);
	this.shape.snapToPixel = true;
	this.shape.cache(0, 0, this.width, this.height);
	
	this.container.addChild(this.shape);

	this.setPhysics();

	this.setIsAlive(false);
};

/**
*@override
*@public
*/
CentipedeSegment.prototype.update = function(pos) {

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
	this.position.x = this.container.x = (x + this.offset.x);
	this.position.y = this.container.y = (y + this.offset.y);

	this.physicalPosition.x = this.position.x / app.physicsScale;
	this.physicalPosition.y = this.position.y / app.physicsScale;
	
	this.body.SetPosition(this.physicalPosition);
};

CentipedeSegment.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef(),
		scale = app.physicsScale,
		w = (this.width * 0.5),
		h = (this.height * 0.5);
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = this.categoryBits;
	fixDef.filter.maskBits = this.maskBits;
	fixDef.isSensor = true;
	fixDef.shape = new app.b2PolygonShape();
	fixDef.shape.SetAsBox(w / scale,  h / scale);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetAwake(true);
};

goog.exportSymbol('CentipedeSegment', CentipedeSegment);