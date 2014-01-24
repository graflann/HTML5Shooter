goog.provide('Item');

goog.require('GameObject');
goog.require('CollisionCategories');

/**
*@constructor
*An item with collision that is typically for the user to acquire (e.g. energy, pow, etc.)
*/
Item = function(categoryBits) {
	GameObject.call(this);

	this.categoryBits = categoryBits;

	/**
	*@type {Container}
	*/
	this.container = null;
	
	/**
	*@type {DisplayObject}
	*/
	this.shape = null;
	
	/**
	*physical body added to Box2D physicsWorld
	*@type {Box2D.Dynamics.b2Body}
	*/
	this.body = null;

	this.physicalPosition = new app.b2Vec2();
};

goog.inherits(Item, GameObject)

/**
*@override
*@public
*/
Item.prototype.init = function() {
	this.setIsAlive(false);
};

/**
*@override
*@public
*/
Item.prototype.update = function(options) {

	if(this.isAlive) {
		this.physicalPosition = this.body.GetPosition();

		this.container.x = this.physicalPosition.x * app.physicsScale;
		this.container.y = this.physicalPosition.y * app.physicsScale;

		this.container.rotation = Math.radToDeg(this.body.GetAngle());

		this.checkBounds();
	}
};

/**
*@override
*@public
*/
Item.prototype.clear = function() {
	this.shape.getStage().removeChild(this.shape);
	
	this.shape = null;
};

Item.prototype.kill = function() {
	if(this.isAlive) {
		this.setIsAlive(false);
		this.container.getStage().removeChild(this.container);
	}
};

/**
*@override
*@public
*/
Item.prototype.create = function(options) {
	var forceTarget;

	this.setPosition(
		Math.randomInRange(
			options.posX - options.posOffsetX, 
			options.posX + options.posOffsetX
		),
		Math.randomInRange(
			options.posY - options.posOffsetY, 
			options.posY + options.posOffsetY
		)
	);
	
	this.velocity.x = Math.randomInRange(-options.velX, options.velX);
	this.velocity.y = Math.randomInRange(-options.velY, options.velY);

	if(options.isRotated) {
		var rotation = Math.randomInRange(0, 360);
		this.body.SetAngle(Math.degToRad(rotation));
		this.container.rotation = rotation;
	}

	this.setIsAlive(true);

	//create an off-center target to produce some spin
	forceTarget = this.body.GetWorldCenter();
	forceTarget.x += 0.75;
	forceTarget.y += 0.75;

	this.body.ApplyForce(this.velocity, forceTarget);
	
	app.layers.getStage(LayerTypes.MAIN).addChild(this.container);
};

Item.prototype.setIsAlive = function(value) {
	this.body.SetAwake(value);
	this.body.SetActive(value);
	this.isAlive = value;
};

Item.prototype.setPosition = function(x, y) {
	this.position.x = this.container.x = x;
	this.position.y = this.container.y = y;

	this.physicalPosition.x = this.position.x / app.physicsScale;
	this.physicalPosition.y = this.position.y / app.physicsScale;
	
	this.body.SetPosition(this.physicalPosition);
};

/**
*@override
*@public
*/
Item.prototype.checkBounds = function() {
	var pos = this.body.GetPosition(),
		scale = app.physicsScale,
		stage = app.layers.getStage(LayerTypes.MAIN),
		minX = 0,
		minY = 0, 
		maxX = app.arenaWidth / scale,
		maxY = app.arenaHeight / scale; 

	if((pos.x < minX || pos.x > maxX) || (pos.y < minY || pos.y > maxY)) {
		this.kill();
	}
};

/**
*@override
*@public
*/
Item.prototype.onCollide = function(collisionObject, options) {


	//CANNOT DO DURING BOX2D TIMESTEP!!!
	//this.kill();
};


