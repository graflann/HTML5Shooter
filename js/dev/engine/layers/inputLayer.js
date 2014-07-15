goog.provide('InputLayer');

goog.require('Layer');
goog.require('TargetCursor');

/**
*@constructor
*custom layer handles all input; always on top of the display list, rendering cursors, etc.
*/
InputLayer = function(parent, id, zIndex) {
	this.cursor = null;

	this.arrCallbacks = [];

	this.isMouseDown = false;

	Layer.call(this, parent, id, zIndex);
};

goog.inherits(InputLayer, Layer);

InputLayer.ROUTER = {
	stagemousedown: "onStageMouseDown",
	stagemouseup: 	"onStageMouseUp"
};

InputLayer.prototype.init = function(options) {
	Layer.prototype.init.call(this, options);

	this.setTabIndex("0");
	this.setZindex(100000);
	this.getStage().mouseEnabled = true;
	this.getSelector().focus();

	this.cursor = new TargetCursor(this);
};

/**
*@public
*/
InputLayer.prototype.update = function(options) {
	var stage = this.getStage(),
		selector = this.getSelector();

	if(stage.mouseInBounds)
	{
		if(selector.css('cursor') == 'auto') {
			selector.css('cursor', 'none');
			this.cursor.add();
		}

		this.cursor.container.x = stage.mouseX;
		this.cursor.container.y = stage.mouseY;
		this.cursor.update();
	}
	else
	{
		if(selector.css('cursor') == 'none') {
			selector.css('cursor', 'auto');
			this.cursor.remove();
		}
	}
};

InputLayer.prototype.clear = function() {
	this.getStage().removeAllEventListeners();

	this.cursor.clear();

	for(var eventType in arrCallbacks) {
		delete arrCallbacks[eventType];
	}

	arrCallbacks = null;

	Layer.prototype.clear(this);
};

InputLayer.prototype.setListener = function(eventType, callback) {
	var stage = this.getStage(),
		self = this;

	if(stage.hasEventListener(eventType)) {
		stage.removeEventListener(eventType, this.arrCallbacks[eventType]);
		delete this.arrCallbacks[eventType];
	}

	this.arrCallbacks[eventType] = function(e) {
		self[InputLayer.ROUTER[eventType]](e);
		callback(e);
	};

	stage.addEventListener(eventType, this.arrCallbacks[eventType]);
};

InputLayer.prototype.getIsMouseDown = function() {
	return this.isMouseDown;
};

InputLayer.prototype.onStageMouseDown = function(e) {
	this.isMouseDown = true;
};

InputLayer.prototype.onStageMouseUp = function(e) {
	this.isMouseDown = false;	
};

goog.exportSymbol('InputLayer', InputLayer);