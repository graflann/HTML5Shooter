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

	this.inputOptions = null;

	this.init();
};

goog.inherits(OptionsPanel, Panel);

/**
*@override
*@protected
*/
OptionsPanel.prototype.init = function() {
	var stage = null;

	app.layers.add(LayerTypes.MAIN);
	stage = app.layers.getStage(LayerTypes.MAIN);

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

	this.inputOptions = new InputOptions();
	this.inputOptions.container.x = Constants.WIDTH * 0.125;
	this.inputOptions.container.y = 64;

	stage.addChild(this.background);
	stage.addChild(this.grid.shape);
    stage.addChild(this.inputOptions.container);
};

/**
*@override
*@protected
*/
OptionsPanel.prototype.update = function() {
	this.inputOptions.update();

	Panel.prototype.update.call(this);

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
	this.background = null;


};