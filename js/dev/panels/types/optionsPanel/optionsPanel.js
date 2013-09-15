goog.provide('OptionsPanel');

goog.require('Panel');
goog.require('InputOptions');

/**
*@constructor
*Game options manipulated here
*/
OptionsPanel = function() {
	Panel.call(this);

	this.background = null;

	this.grid = null;

	this.exitText = null;

	this.inputOptions = null;

	this.init();
};

goog.inherits(OptionsPanel, Panel);

/**
*@override
*@protected
*/
OptionsPanel.prototype.init = function() {
	var stage = app.layers.getStage(LayerTypes.MAIN),
		exitLabel = "press b to exit";

	this.background = new createjs.Shape();
	this.background.graphics
		.lf([Constants.DARK_BLUE, Constants.BLACK], [0, 1], 0, Constants.WIDTH, 0, Constants.HEIGHT)
		.dr(0, 0, Constants.WIDTH, Constants.HEIGHT);
	
	this.grid = new Grid(
		Constants.WIDTH + Constants.UNIT, 
		Constants.HEIGHT, 
		Constants.UNIT, 
		Constants.WHITE
	);

	this.inputOptions = new InputOptions();
	this.inputOptions.container.x = Constants.WIDTH * 0.125;
	this.inputOptions.container.y = 64;

	this.exitText = new createjs.Text(
		exitLabel, 
		"16px AXI_Fixed_Caps_5x5", 
		Constants.LIGHT_BLUE
	);
	this.exitText.x = this.inputOptions.container.x + (this.inputOptions.width * 0.5) - 
		(exitLabel.length * app.charWidth);
	this.exitText.y = this.inputOptions.container.y + this.inputOptions.height;

	stage.addChild(this.background);
	stage.addChild(this.grid.shape);
    stage.addChild(this.inputOptions.container);
    stage.addChild(this.exitText);
};

/**
*@override
*@protected
*/
OptionsPanel.prototype.update = function() {
	var input = app.input;

	Panel.prototype.update.call(this);

	this.grid.update();

	this.inputOptions.update();

	if(input.isButtonPressedOnce(GamepadCode.BUTTONS.B)) {
		this.nextPanelKey = PanelTypes.PLAY_PANEL;
		goog.events.dispatchEvent(this, this.panelChangeEvent);
	}

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
		GamepadCode.BUTTONS.DPAD_RIGHT
	]);
};

/**
*@override
*@protected
*/
OptionsPanel.prototype.clear = function() {
	Panel.prototype.clear.call(this);

	this.background.graphics.clear();
	this.grid.clear();
	this.inputOptions.clear();

	this.exitText = null;
	this.background = null;
	this.grid = null;
	this.inputOptions = null;
};