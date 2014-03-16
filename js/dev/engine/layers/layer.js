goog.provide('Layer');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('Constants');

/**
*@constructor
*Layers are HTML canvas element with 2D contexts in screen dimensions
*/
Layer = function(parent, id, zIndex) {
	//PRIVATE///////////////////////////////////////////
	var _parent = parent;

	var _id = id;

	var _zIndex = zIndex || 0;

	var _el = null;

	var _stage 	= null;

	var _context = null;

	var _selector = null;
	////////////////////////////////////////////////////

	//PUBLIC////////////////////////////////////////////
	//GET
	this.getParent 		= function() { return _parent; };
	this.getId 			= function() { return _id; };
	this.getZindex 		= function() { return _zIndex; };
	this.getEl 			= function() { return _el; };
	this.getStage 		= function() { return _stage; };
	this.getContext 	= function() { return _context; };
	this.getSelector 	= function() { return _selector; };

	//SET
	this.setInit = function() {
		_el = document.createElement("canvas");

		_selector = $(_el);
		_selector
			.attr({ 
				id: _id, 
				width: Constants.WIDTH,
				height: Constants.HEIGHT 
			})
			.css({ 
				"position": "absolute",
				"z-index": _zIndex 
			});

		_parent.append(_el);

		_stage = new createjs.Stage(_id);

		_context = document.getElementById(_id).getContext("2d");
	};

	this.setClear = function() {
		_stage.removeAllChildren();
		_stage.removeAllEventListeners();
		_stage = null;

		_context = null;

		_selector.remove();
		_selector = null;

		_el = null;

		_parent = null;
	};

	this.setZindex = function(value) {
		_zIndex = value;
		_selector.css("z-index", _zIndex);
	};
	////////////////////////////////////////////////////

	this.init();
};

goog.inherits(Layer, goog.events.EventTarget);

/**
*@public
*/
Layer.prototype.init = function() {
	this.setInit();
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
	this.setClear();
};

/**
*@public
*/
Layer.prototype.setTabIndex = function(value) {
	this.getSelector().attr("tabindex", value);
};

goog.exportSymbol('Layer', Layer);