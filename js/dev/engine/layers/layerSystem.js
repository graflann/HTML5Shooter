goog.provide('LayerSystem');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('Layer');
goog.require('LayerTypes');

/**
*@constructor
*Manages layer container and its elements
*/
LayerSystem = function() {
	this.container = null;

	this.arrLayers = [];

	this.debugLayer = null;

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

	this.add(LayerTypes.MAIN);
	this.getLayer(LayerTypes.MAIN).setTabIndex("1");
	this.getSelector(LayerTypes.MAIN).focus();
};

LayerSystem.prototype.update = function() {
	var layers = this.arrLayers,
		key;

	//update all createjs.Stage instances
	for(key in layers) {
		this.getStage(key).update();
	}

	//this.getDebugStage().update();
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
		} else {
			this.remove(key);
		}
	}

	if(this.debugLayer) {
		this.debugLayer.clear();
		this.debugLayer = null;
	}
};

/**
*@public
*/
LayerSystem.prototype.add = function(id) {
	//console.log("z-index: " + this.length() + " - " + id);

	this.arrLayers[id] = new Layer(this.container, id, this.length());
};

/**
*@public
*/
LayerSystem.prototype.addDebug = function() {
	//console.log("z-index: " + this.length() + " - " + LayerTypes.DEBUG);

	this.debugLayer = new Layer(this.container, LayerTypes.DEBUG, this.length());
};

/**
*@public
*/
LayerSystem.prototype.remove = function(id) {
	this.arrLayers[id].clear();
	this.arrLayers[id] = null;
	//this.arrLayers.splice(id, 1);
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
	return this.getLayer(id).stage;
};

/**
*Returns CreateJS Stage instance of Layer 
*@public
*/
LayerSystem.prototype.getDebugStage = function() {
	return this.debugLayer.stage;
};

/**
*Returns Layer canvas 2D context 
*@public
*/
LayerSystem.prototype.getContext = function(id) {
	return this.getLayer(id).context;
};

/**
*Returns Layer canvas 2D context 
*@public
*/
LayerSystem.prototype.getDebugContext = function() {
	return this.debugLayer.context;
};

/**
*Returns Layer element by id wrapped in jquery 
*@public
*/
LayerSystem.prototype.getSelector = function(id) {
	return this.arrLayers[id].selector;
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
		temp = firstLayer.zIndex;

	firstLayer.setZindex(secondLayer.zIndex);
	secondLayer.setZindex(temp);
};

/**
*@public
*/
LayerSystem.prototype.length = function() {
	return Object.size(this.arrLayers);
};

/**
*@public
*/
LayerSystem.prototype.setDebug = function(isDebugging) {
	var layers = this.arrLayers,
		stage,
		key;

	for(key in layers) {
		stage = this.getStage(key);

		//stage.autoClear = !isDebugging;
		stage.alpha = 1 - (isDebugging * 0.85); // draws the stage graphics with appropriate alpha
	}

	this.getDebugStage().autoClear = !isDebugging;
};

goog.exportSymbol('LayerSystem', LayerSystem);