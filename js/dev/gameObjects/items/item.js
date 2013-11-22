goog.provide('Item');

goog.require('GameObject');
goog.require('CollisionCategories');

/**
*@constructor
*An item with collision that is typically for the user to acquire (e.g. energy, pow, etc.)
*/
Item = function(categoryBits, maskBits) {
	GameObject.call(this);

	this.categoryBits = categoryBits;
	
	this.maskBits = maskBits;

	/**
	*@type {Container}
	*/
	this.container = null;
	
	/**
	*@type {DisplayObject}
	*/
	this.shape;
	
	/**
	*physical body added to Box2D physicsWorld
	*@type {Box2D.Dynamics.b2Body}
	*/
	this.body;

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
	this.physicalPosition.x = this.position.x / app.physicalScale;
	this.physicalPosition.y = this.position.y / app.physicalScale;

	this.checkBounds();
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
		this.shape.getStage().removeChild(this.shape);
	}
};

/**
*@override
*@public
*/
Item.prototype.create = function(options) {
	this.container.x = Math.randomInRange(
		options.posX - options.posOffsetX, 
		options.posX + options.posOffsetX
	);
	this.container.y = Math.randomInRange(
		options.posY - options.posOffsetY, 
		options.posY + options.posOffsetY
	);
	
	this.velocity.x = Math.randomInRange(-options.velX, options.velX);
	this.velocity.y = Math.randomInRange(-options.velY, options.velY);

	if(options.isRotated) {
		this.container.rotation = Math.randomInRange(0, 360);
	}
	
	this.isAlive = true;
	
	app.layers.getStage(LayerTypes.MAIN).addChild(this.container);
};

Item.prototype.setIsAlive = function(value) {
	this.body.SetAwake(value);
	this.body.SetActive(value);
	this.isAlive = value;
};

/**
*@override
*@public
*/
Item.prototype.checkBounds = function() {
	var pos = this.body.GetPosition(),
		scale = app.physicsScale,
		stage = app.layers.getStage(LayerTypes.MAIN),
		minX = -stage.x / scale,
		minY = -stage.y / scale, 
		maxX = minX + Constants.WIDTH / scale,
		maxY = minY + Constants.HEIGHT / scale; 

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


