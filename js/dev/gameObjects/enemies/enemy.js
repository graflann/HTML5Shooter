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

	this.isWaveEnabled = true;

	this.timer = null;

	this.debugShape = null;

	this.scoreValue = 100;

	this.enemyKilledEvent = new goog.events.Event(EventNames.ENEMY_KILLED, this);
	this.forcedKillEvent = new PayloadEvent(EventNames.FORCED_KILL, this, null);
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
Enemy.prototype.update = function(options) {};

/**
*@private
*/
Enemy.prototype.updateDebug = function() {
	if(app.physicsDebug) {

		if(this.debugShape.parent === null || this.debugShape.parent === undefined) {
			this.container.getStage().addChild(this.debugShape);
		}

		this.debugShape.x = this.position.x;
		this.debugShape.y = this.position.y;

	} else if (!app.physicsDebug && (this.debugShape.parent != null || this.debugShape.parent != undefined)) {
		this.container.getStage().removeChild(this.debugShape);
	}
};

/**
*@public
*/
Enemy.prototype.clear = function() {
	GameObject.prototype.clear.call(this);

	if(this.container) {
		this.container.removeAllChildren();
		this.container = null;
	}

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

	this.clearTimer();

	this.enemyKilledEvent = null;
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

		this.dispatchKillEvent();
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
	}

	return this.health;
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
Enemy.prototype.getMaskBits = function() {
	return this.maskBits;
};

/**
*@public
*/
Enemy.prototype.getScoreValue = function() {
	return this.scoreValue;
};

/**
*@public
*/
Enemy.prototype.dispatchKillEvent = function() {
	if(this.isWaveEnabled) {
		goog.events.dispatchEvent(this, this.enemyKilledEvent);
	}
};

/**
*@public
*/
Enemy.prototype.clearTimer = function() {
	if(this.timer) {
		clearTimeout(this.timer);
		this.timer = null;
	}
};

/**
*@public
*/
Enemy.prototype.onCollide = function(collisionObject, options) {

	if(this.modifyHealth(collisionObject.damage) === 0) {
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