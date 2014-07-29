goog.provide('InputLayer');

goog.require('Layer');
goog.require('TargetCursor');
goog.require('MouseCode');

/**
*@constructor
*custom layer handles all input; always on top of the display list, rendering cursors, etc.
*/
InputLayer = function(parent, id, zIndex) {
	this.cursor = null;

	this.arrCallbacks = [];

	this.prevMousePosition = new app.b2Vec2();

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

	this.setKeyboardAndMouse();

	this.cursor = new TargetCursor(this);
};

/**
*@public
*/
InputLayer.prototype.update = function(options) {
	var stage = this.getStage(),
		selector = this.getSelector();

	//checks for mouse movement
	if(this.prevMousePosition.x != stage.mouseX || this.prevMousePosition.y != stage.mouseY) {
		app.input.setState(Input.STATES.KEYBOARD_AND_MOUSE);
	}

	if(stage.mouseInBounds)
	{
		var cursorIndex = stage.getChildIndex(this.cursor.container);
		
		//ensure the default cursor doesn't render over stage
		if(selector.css('cursor') == 'auto') {
			selector.css('cursor', 'none');
		}

		if(app.input.getState() == Input.STATES.KEYBOARD_AND_MOUSE) {
			if(cursorIndex < 0) {
				this.cursor.add();
			}

			this.cursor.container.x = stage.mouseX;
			this.cursor.container.y = stage.mouseY;
			this.cursor.update();
		} else if (app.input.getState() == Input.STATES.GAMEPAD && cursorIndex > -1) {
			this.cursor.remove();
		}
	}
	else
	{
		if(selector.css('cursor') == 'none') {
			selector.css('cursor', 'auto');
			this.cursor.remove();
		}
	}

	this.prevMousePosition.x = stage.mouseX;
	this.prevMousePosition.y = stage.mouseY;
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

InputLayer.prototype.setKeyboardAndMouse = function() {
	var stageSelector = this.getSelector(LayerTypes.INPUT),
		input = app.input;

	//keyboard callbacks
	stageSelector.keydown(function(e) { 
		input.setState(Input.STATES.KEYBOARD_AND_MOUSE);
		input.onKeyDown(e); 
	});

	stageSelector.keyup(function(e) { input.onKeyUp(e); });

	//mouse callbacks
	this.setListener(EventNames.STAGE_MOUSE_DOWN);
	this.setListener(EventNames.STAGE_MOUSE_UP);

	stageSelector.focus();
};

InputLayer.prototype.setListener = function(eventType) {
	var stage = this.getStage(),
		self = this;

	if(stage.hasEventListener(eventType)) {
		stage.removeEventListener(eventType, this.arrCallbacks[eventType]);
		delete this.arrCallbacks[eventType];
	}

	this.arrCallbacks[eventType] = function(e) {
		self[InputLayer.ROUTER[eventType]](e);
	};

	stage.addEventListener(eventType, this.arrCallbacks[eventType]);
};

InputLayer.prototype.onStageMouseDown = function(e) {
	app.input.arrMouseDown[e.nativeEvent.button] = true;
};

InputLayer.prototype.onStageMouseUp = function(e) {
	app.input.arrMouseDown[e.nativeEvent.button] = false;
};

goog.exportSymbol('InputLayer', InputLayer);