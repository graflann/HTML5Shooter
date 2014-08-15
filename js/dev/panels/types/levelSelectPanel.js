goog.provide('LevelSelectPanel');

goog.require('Panel');
goog.require('LevelSelectorContainer');

/**
*@constructor
*Game options manipulated here
*/
LevelSelectPanel = function() {
	Panel.call(this);

	this.container = null;

	this.background = null;

	this.grid = null;

	this.levelSelectorContainer = null;

	this.init();
};

goog.inherits(LevelSelectPanel, Panel);

/**
*@override
*@protected
*/
LevelSelectPanel.prototype.init = function() {
	var self = this,
		stage = app.layers.getStage(LayerTypes.MAIN);

	this.container = new createjs.Container();

	this.background = new createjs.Shape();
	this.background.graphics
		.lf([Constants.DARK_BLUE, Constants.BLACK], [0, 0.75], 0, 0, 0, Constants.HEIGHT)
		.dr(0, 0, Constants.WIDTH, Constants.HEIGHT);
	
	this.grid = new Grid(
		Constants.WIDTH + Constants.UNIT, 
		Constants.HEIGHT, 
		Constants.UNIT, 
		Constants.WHITE
	);

	this.levelSelectorContainer = new LevelSelectorContainer(this.levelProxy);
	this.levelSelectorContainer.container.x = Constants.UNIT;
	this.levelSelectorContainer.container.y = Constants.UNIT;

	this.levelSelectorContainer.setConnectorIsActiveByIndex(0, true);

	this.container.addChild(this.grid.shape);
	this.container.addChild(this.levelSelectorContainer.container);

	stage.addChild(this.background);
    stage.addChild(this.container);

    setTimeout(function() {
		self.isInited = true;

		//once loaded and inited notify the game to remove the loading screen
		goog.events.dispatchEvent(self, new goog.events.Event(EventNames.PANEL_LOAD_COMPLETE, self));
	}, 1000);
};

/**
*@override
*@protected
*/
LevelSelectPanel.prototype.update = function() {
	var input = app.input;

	Panel.prototype.update.call(this);

	this.grid.update();

	this.levelSelectorContainer.update();

	if(input.isExiting()) {
		this.onExit();
	}

	app.input.checkPrevButtonDown([
		GamepadCode.BUTTONS.DPAD_UP,
		GamepadCode.BUTTONS.DPAD_DOWN,
		GamepadCode.BUTTONS.DPAD_LEFT,
		GamepadCode.BUTTONS.DPAD_RIGHT,
		GamepadCode.BUTTONS.B,
		GamepadCode.BUTTONS.BACK
	]);

	app.input.checkPrevKeyDown([
		KeyCode.UP,
		KeyCode.DOWN,
		KeyCode.LEFT,
		KeyCode.RIGHT,
		KeyCode.BACKSPACE,
		KeyCode.ESCAPE
	]);
};

/**
*@override
*@protected
*/
LevelSelectPanel.prototype.clear = function() {
	Panel.prototype.clear.call(this);

	this.levelSelectorContainer.clear();
	this.levelSelectorContainer = null;

	this.background.graphics.clear();
	this.grid.clear();

	this.background = null;
	this.grid = null;
};

/**
*@override
*@protected
*/
LevelSelectPanel.prototype.onExit = function() {
	var self = this;

	createjs.Tween.get(this.container)
		.to({ 
			alpha: 0
		}, 1000)
		.call(function () { 
			self.isInited = false;
			
			goog.events.dispatchEvent(
				self, 
				new PayloadEvent(
					EventNames.PANEL_CHANGE, 
					self,
					{ panelKey: PanelTypes.PLAY_PANEL }
				)
			);
		});
};