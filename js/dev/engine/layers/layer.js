goog.provide('Layer');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('Constants');

/**
*@constructor
*Parent in-game action object
*/
Layer = function(parent, id, zIndex) {
	this.parent = parent;

	this.id = id;

	this.zIndex = zIndex || 0;

	this.el = null;

	this.stage 	= null;

	this.context = null;

	this.selector = null;

	this.init();
};

goog.inherits(Layer, goog.events.EventTarget);

/**
*@public
*/
Layer.prototype.init = function() {
	this.el = document.createElement("canvas");

	this.selector = $(this.el);
	this.selector
		.attr({ 
			id: this.id, 
			width: Constants.WIDTH,
			height: Constants.HEIGHT 
		})
		.css({ 
			"position": "absolute",
			"z-index": this.zIndex 
		});

	this.parent.append(this.el);

	this.stage = new createjs.Stage(this.id);

	this.context = document.getElementById(this.id).getContext("2d");
};

/**
*@public
*/
Layer.prototype.update = function(options) {
	
};

/**
*@public
*/
Layer.prototype.clear = function() {
	this.context = null;

	this.stage.removeAllChildren();
	this.stage.removeAllEventListeners();
	this.stage = null;

	this.selector.remove();
	this.selector = null;

	delete this.el;
};

/**
*@public
*/
Layer.prototype.setZindex = function(value) {
	this.zIndex = value;
	this.selector.css("z-index", this.zIndex);
};

/**
*@public
*/
Layer.prototype.setTabIndex = function(value) {
	this.selector.attr("tabindex", value);
};

goog.exportSymbol('Layer', Layer);