goog.provide('Projectile');

goog.require('GameObject');
goog.require('CollisionCategories');

/**
*@constructor
*Ammo for Turret instaces
*/
Projectile = function(colors, categoryBits, maskBits) {
	GameObject.call(this);

	/**
	*@type  {String}
	*/
	this.arrColors = colors;

	this.categoryBits = categoryBits;
	
	this.maskBits = maskBits;
	
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

	this.damage = 1;
	
	/**
	*physical body added to Box2D physicsWorld
	*@type {}
	*/
	this.velocityMod = 256;
};

goog.inherits(Projectile, GameObject)

/**
*@override
*@public
*/
Projectile.prototype.init = function() {
	this.setIsAlive(false);
};

/**
*@override
*@public
*/
Projectile.prototype.update = function(options) {
	this.physicalPosition.x = this.position.x / app.physicalScale;
	this.physicalPosition.y = this.position.y / app.physicalScale;

	this.checkBounds();
};

/**
*@override
*@public
*/
Projectile.prototype.clear = function() {
	this.shape.getStage().removeChild(this.shape);
	
	this.shape = null;
};

Projectile.prototype.kill = function() {
	if(this.isAlive) {
		this.setIsAlive(false);
		this.shape.getStage().removeChild(this.shape);
	}
};

Projectile.prototype.setIsAlive = function(value) {
	this.body.SetAwake(value);
	this.body.SetActive(value);
	this.isAlive = value;
};

/**
*@override
*@public
*/
Projectile.prototype.checkBounds = function() {
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
Projectile.prototype.onCollide = function(collisionObject, options) {

	if(collisionObject instanceof Enemy || collisionObject instanceof PlayerTank) {
		options.positiveHit.emit(1, {
			posX: this.shape.x,
			posY: this.shape.y,
			posOffsetX: 0,
			posOffsetY: 0,
			velX: 0,
			velY: 0
		});
	} else {
		options.neutralHit.emit(1, {
			posX: this.shape.x,
			posY: this.shape.y,
			posOffsetX: 0,
			posOffsetY: 0,
			velX: 0,
			velY: 0
		});
	}

	//CANNOT DO DURING BOX2D TIMESTEP!!!
	//this.kill();
};


