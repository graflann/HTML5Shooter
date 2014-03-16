goog.provide('GameObject');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');

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
	this.position = null;
	this.velocity = null;
};

/**
*@public
*/
GameObject.prototype.kill = function() {
	
};

goog.exportSymbol('GameObject', GameObject);