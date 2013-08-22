goog.provide('Brick');

goog.require('SceneObject');

/**
*@constructor
*Bricks construct the walls
*/
Brick = function(unit, color) {
	SceneObject.call(this);

	/**
	*@type  {Number}
	*/
	this.unit = unit;
	
	/**
	*@type  {String}
	*/
	this.color = color;
	
	this.init();
};

goog.inherits(Brick, SceneObject)

/**
*@override
*@public
*/
Brick.prototype.init = function() {
	this.shape = new createjs.Shape();
	this.shape.graphics.ss(1).s(this.color).f("#000").dr(0, 0, this.unit, this.unit);

    app.layers.getStage(LayerTypes.MAIN).addChild(this.shape);
	
	this.setPhysics();
};

/**
*@override
*@public
*/
Brick.prototype.update = function(options) {
	
};

/**
*@override
*@public
*/
Brick.prototype.clear = function() {
	this.shape.getStage().removeChild(this.shape);
	
	this.shape = null;
};

/**
*@private
*/
Brick.prototype.setPosition = function(x, y) {
	var offset = (this.unit * 0.5 / app.physicsScale);
	
	this.shape.x = x;
	this.shape.y = y;
	
	this.body.SetPosition( 
		new app.b2Vec2(
			(x / app.physicsScale) + offset, 
			(y / app.physicsScale) + offset
		)
	);
};

/**
*@private
*/
Brick.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef(),
		unit = this.unit / (app.physicsScale * 2);
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = CollisionCategories.SCENE_OBJECT;
	fixDef.shape = new app.b2PolygonShape();
	fixDef.shape.SetAsBox(unit, unit);
	
	bodyDef.type = app.b2Body.b2_staticBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetAwake(false);
};