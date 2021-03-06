goog.provide('LayerSystem');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('Layer');
goog.require('InputLayer');
goog.require('LayerTypes');

/**
*@constructor
*Manages layer container and its elements
*/
LayerSystem = function() {
	this.container = null;

	this.arrLayers = [];

	this.debugLayer = null;

	this.inputLayer = null;

	this.index = 0;

	this.init();
};

goog.inherits(LayerSystem, goog.events.EventTarget);

/**
*@private
*/
LayerSystem.instance = null;

/**
*@ return {BrowserUtils}
*/
LayerSystem.getInstance = function() {
    if(LayerSystem.instance == null) {
        LayerSystem.instance = new LayerSystem();
    }

    return LayerSystem.instance;
};

/**
*@public
*/
LayerSystem.prototype.init = function() {
	this.container = $("#gameContainer");

	//"main" rendering layer that is always present through the course of the app
	this.add(LayerTypes.MAIN);

	//layer handles all input; always on top of the display list, rendering cursors, etc.
	this.add(LayerTypes.INPUT);
};

LayerSystem.prototype.update = function() {
	var layers = this.arrLayers,
		key;

	//update all createjs.Stage instances
	for(key in layers) {
		this.getStage(key).update();
	}

	this.getLayer(LayerTypes.INPUT).update();
};

/**
*@public
*/
LayerSystem.prototype.clear = function() {
	var key;

	for(key in this.arrLayers) {
		//At least one main layer is retained in all panels
		if(key === LayerTypes.MAIN) {
			//only remove children / listeners from main Stage
			this.getStage(LayerTypes.MAIN).removeAllChildren();
			this.getStage(LayerTypes.MAIN).removeAllEventListeners();

		//a LoadingPanel instance handle this Layer in house; force other Panel clean-up to ignore
		} else if (key === LayerTypes.LOADING || key === LayerTypes.INPUT) {
			continue;
		} else {
			this.remove(key);
		}
	}
};

/**
*@public
*/
LayerSystem.prototype.add = function(id, zIndex) {
	var _zIndex = zIndex || this.length();

	if(id == LayerTypes.INPUT) {
		this.arrLayers[id] = new InputLayer(this.container, id, _zIndex);
	} else {
		this.arrLayers[id] = new Layer(this.container, id, _zIndex);
	}
	
	this.arrLayers[id].getStage().mouseEnabled = false;
	this.arrLayers[id].getStage().mouseChildren = false;

	return this.arrLayers[id];
};

/**
*@public
*/
LayerSystem.prototype.remove = function(id) {
	this.arrLayers[id].clear();
	this.arrLayers[id] = null;

	delete this.arrLayers[id];
};

/**
*Returns Layer instance
*@public
*/
LayerSystem.prototype.getLayer = function(id) {
	return this.arrLayers[id];
};

/**
*Returns CreateJS Stage instance of Layer 
*@public
*/
LayerSystem.prototype.getStage = function(id) {
	return this.getLayer(id).getStage();
};

/**
*Returns Layer canvas 2D context 
*@public
*/
LayerSystem.prototype.getContext = function(id) {
	return this.getLayer(id).getContext();
};

/**
*Returns Layer element by id wrapped in jquery 
*@public
*/
LayerSystem.prototype.getSelector = function(id) {
	return this.arrLayers[id].getSelector();
};

/**
*Returns parent container of all Layer instances wrapped in jquery
*@public
*/
LayerSystem.prototype.getContainer = function() {
	return this.container;
};

/**
*@public
*/
LayerSystem.prototype.swapLayers = function(firstId, secondId) {
	var firstLayer = this.arrLayers[firstId],
		secondLayer = this.arrLayers[secondId],
		temp = firstLayer.getZindex();

	firstLayer.setZindex(secondLayer.getZindex());
	secondLayer.setZindex(temp);
};

/**
*@public
*/
LayerSystem.prototype.length = function() {
	return Object.size(this.arrLayers);
};

goog.exportSymbol('LayerSystem', LayerSystem);