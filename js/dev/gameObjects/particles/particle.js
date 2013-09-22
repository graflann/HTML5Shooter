goog.provide('Particle');

goog.require('GameObject');

/**
*@constructor
*Ammo for Turret instaces
*/
Particle = function(color) {
	GameObject.call(this);

	/**
	*@type  {String}
	*/
	this.color = color;
	
	/**
	*@type {DisplayObject}
	*/
	this.shape;
};

goog.inherits(Particle, GameObject)

/**
*@override
*@public
*/
Particle.prototype.init = function() {
	this.isAlive = false;
};

/**
*@override
*@public
*/
Particle.prototype.update = function(options) {
	if (this.isAlive) {
		this.position.x = this.shape.x += this.velocity.x;
		this.position.y = this.shape.y += this.velocity.y;
		
		//checkBounds();
	}
};

/**
*@override
*@public
*/
Particle.prototype.clear = function() {
	this.shape.getStage().removeChild(this.shape);
	
	this.shape = null;
};

/**
*@override
*@public
*/
Particle.prototype.create = function(options) {
	this.shape.x = Math.randomInRange(
		options.posX - options.posOffsetX, 
		options.posX + options.posOffsetX
	);
	this.shape.y = Math.randomInRange(
		options.posY - options.posOffsetY, 
		options.posY + options.posOffsetY
	);
	
	this.velocity.x = Math.randomInRange(-options.velX, options.velX);
	this.velocity.y = Math.randomInRange(-options.velY, options.velY);

	if(options.isRotated) {
		this.shape.rotation = Math.randomInRange(0, 360);
	}
	
	this.isAlive = true;
	
	app.layers.getStage(LayerTypes.MAIN).addChild(this.shape);
};

Particle.prototype.kill = function() {
	if(this.isAlive) {
		this.shape.getStage().removeChild(this.shape);
		this.isAlive = false;
	}
};

/**
*@override
*@public
*/
Particle.prototype.checkBounds = function() {
	var pos = this.position,
		stage = app.layers.getStage(LayerTypes.MAIN),
		minX = -stage.x,
		minY = -stage.y, 
		maxX = minX + Constants.WIDTH,
		maxY = minY + Constants.HEIGHT; 

	if((pos.x < minX || pos.x > maxX) || (pos.y < minY || pos.y > maxY)) {
		this.kill();
	}
};


