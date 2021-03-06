goog.provide('Panel');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');

/**
*@constructor
*Primary / root scene rendering container
*/
Panel = function() {
	this.isInited = false;
};

goog.inherits(Panel, goog.events.EventTarget);

/**
*@protected
*/
Panel.prototype.init = function() { };

/**
*Updates the panel according to game frame rate
*@protected
*/
Panel.prototype.update = function() { };

/**
*Roasts the panel
*@protected
*/
Panel.prototype.clear = function() {
	app.layers.clear();
};