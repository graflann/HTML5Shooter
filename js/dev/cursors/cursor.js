goog.provide('Cursor');

//goog.require('goog.events.EventTarget');
//goog.require('goog.events.Event');
//goog.require('goog.events');

/**
*@constructor
*/
Cursor = function(layer) {
	this.layer = layer;

	/**
	*@type {Container}
	*/
	this.container = null;
};

//goog.inherits(Cursor, goog.events.EventTarget);

/**
*@override
*@public
*/
Cursor.prototype.init = function() {
	this.container = new createjs.Container();
};

/**
*@override
*@public
*/
Cursor.prototype.update = function() {

};

/**
*@override
*@public
*/
Cursor.prototype.clear = function() {
	this.container.removeAllChildren();
};

Cursor.prototype.add = function() {
	this.layer.getStage().addChild(this.container);
	console.log("Cursor added to stage");
};

Cursor.prototype.remove = function() {
	this.layer.getStage().removeChild(this.container);
	console.log("Cursor removed from stage");
};