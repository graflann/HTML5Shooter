goog.provide('Enemy');

goog.require('GameObject');

/**
*@constructor
*Parent in-game action object
*/
Enemy = function() {
	GameObject.call(this);

	this.body = null;

	this.physicalPosition = new app.b2Vec2();

	this.container = null;

	this.health = 0;

	this.categoryBits = null;

	this.maskBits = null;

	this.enemyKilledEvent = new goog.events.Event(EventNames.ENEMY_KILLED, this);
};

goog.inherits(Enemy, GameObject);

/**
*@public
*/
Enemy.prototype.init = function() {
	this.setIsAlive(false);
};

/**
*@public
*/
Enemy.prototype.update = function(options) {
	
};

/**
*@public
*/
Enemy.prototype.clear = function() {
	
};

/**
*@public
*/
Enemy.prototype.create = function() {
	
};

/**
*@public
*/
Enemy.prototype.kill = function() {
	if(this.isAlive) {
		this.setIsAlive(false);

		this.container.getStage().removeChild(this.container);

		goog.events.dispatchEvent(this, this.enemyKilledEvent);
	}
};

Enemy.prototype.setIsAlive = function(value) {
	this.body.SetAwake(value);
	this.body.SetActive(value);
	this.isAlive = value;
};

/**
*@public
*/
Enemy.prototype.setPosition = function(x, y) {

};

/**
*@public
*/
Enemy.prototype.modifyHealth = function(value) {
	this.health -= value;

	if(this.health <= 0) {
		this.health = 0;

		return true;
	}

	return false;
};


/**
*@public
*/
Enemy.prototype.getCategoryBits = function() {
	return this.categoryBits;
};

/**
*@public
*/
Enemy.prototype.onCollide = function(collisionObject, options) {

	if(this.modifyHealth(collisionObject.damage)) {
		options.explosions.emit(4, {
			posX: this.position.x,
			posY: this.position.y,
			posOffsetX: 16,
			posOffsetY: 16,
			velX: 2,
			velY: 2
		});
	}
};

/**
*@public
*/
Enemy.prototype.onHoming = function(homingObject, options) {
	
};

goog.exportSymbol('Enemy', Enemy);