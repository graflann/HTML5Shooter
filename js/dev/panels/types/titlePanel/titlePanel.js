goog.provide('TitlePanel');

goog.require('Panel');
goog.require('GameOptions');

/**
*@constructor
*Title screen
*/
TitlePanel = function() {
	Panel.call(this);
	
	this.background = null;

	this.grid = null;

	this.gameOptions = null;

	this.init();
};

goog.inherits(TitlePanel, Panel);

/**
*@override
*@protected
*/
TitlePanel.prototype.init = function() {	
    var stage = app.layers.getStage(LayerTypes.MAIN);

    this.background = new createjs.Shape();
	this.background.graphics
		.lf([Constants.DARK_BLUE, Constants.BLACK], [0, 1], 0, Constants.WIDTH, 0, Constants.HEIGHT)
		.dr(0, 0, Constants.WIDTH, Constants.HEIGHT);

	this.grid = new Grid(
		Constants.WIDTH, 
		Constants.HEIGHT, 
		Constants.UNIT, 
		Constants.WHITE
	);

	this.gameOptions = new GameOptions();
	this.gameOptions.container.x = (Constants.WIDTH * 0.5) - (this.gameOptions.width * 0.5);
	this.gameOptions.container.y = Constants.HEIGHT * 0.75;

	stage.addChild(this.background);
	stage.addChild(this.grid.shape);
	stage.addChild(this.gameOptions.container);

	goog.events.listen(
		this.gameOptions, 
		EventNames.OPTION_SELECT, 
		this.onOptionSelect, 
		false, 
		this
	);
};

/**
*@override
*@protected
*/
TitlePanel.prototype.update = function() {
	Panel.prototype.update.call(this);

	this.gameOptions.update();

	// app.input.checkPrevKeyDown([
	// 	KeyCode.UP,
	// 	KeyCode.DOWN,
	// 	KeyCode.LEFT,
	// 	KeyCode.RIGHT
	// ]);

	app.input.checkPrevButtonDown([
		GamepadCode.BUTTONS.DPAD_UP,
		GamepadCode.BUTTONS.DPAD_DOWN,
		GamepadCode.BUTTONS.DPAD_LEFT,
		GamepadCode.BUTTONS.DPAD_RIGHT,
		GamepadCode.BUTTONS.START,
		GamepadCode.BUTTONS.A
	]);
};

/**
*@override
*@protected
*/
TitlePanel.prototype.clear = function() {
	Panel.prototype.clear.call(this);

	this.background.graphics.clear();
	this.grid.clear();
	this.gameOptions.clear();

	this.background = null;
	this.grid = null;
	this.gameOptions = null;
};

TitlePanel.prototype.onOptionSelect = function(e) {
	this.nextPanelKey = e.target.panelKey;

	goog.events.unlisten(
		this.gameOptions, 
		EventNames.OPTION_SELECT, 
		this.onOptionSelect, 
		false, 
		this
	);

	goog.events.dispatchEvent(this, this.panelChangeEvent);
};

