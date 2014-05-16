goog.provide('GameObject');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('CollisionRoutingObject');

/**
*@constructor
*Parent in-game action object
*/
GameObject = function() {
	this.width = 0;

	this.height = 0;

	this.velocity = new app.b2Vec2();

	this.position = new app.b2Vec2();

	this.isAlive = false;

	this.collisionRoutingObject = null;
};

goog.inherits(GameObject, goog.events.EventTarget);

/**
*@public
*/
GameObject.prototype.init = function() {
	
};

/**
*@public
*/
GameObject.prototype.update = function(options) {
	
};

/**
*@public
*/
GameObject.prototype.clear = function() {
	goog.events.removeAll();

	this.position = null;
	this.velocity = null;
	this.collisionRoutingObject = null;
};

/**
*@public
*/
GameObject.prototype.kill = function() {
	
};

/**
*@public
*/
GameObject.prototype.getCollisionRoutingObject = function() {
	return this.collisionRoutingObject;
};

goog.exportSymbol('GameObject', GameObject);