goog.provide('OptionsPanel');

goog.require('Panel');
goog.require('InputOptions');

/**
*@constructor
*Game options manipulated here
*/
OptionsPanel = function() {
	Panel.call(this);

	this.container = null;

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
	var self = this,
		stage = app.layers.getStage(LayerTypes.MAIN),
		exitLabel = "press b or esc key to exit";

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

	this.inputOptions = new InputOptions();
	this.inputOptions.container.x = Constants.WIDTH * 0.125;
	this.inputOptions.container.y = 64;

	this.exitText = new createjs.Text(
		exitLabel, 
		"16px AXI_Fixed_Caps_5x5", 
		Constants.RED
	);
	this.exitText.textAlign = "center";
	this.exitText.x = Constants.WIDTH * 0.5;
	this.exitText.y = Constants.HEIGHT * 0.5;

	this.container.addChild(this.grid.shape);
	this.container.addChild(this.inputOptions.container);
	this.container.addChild(this.exitText);

	stage.addChild(this.background);
    stage.addChild(this.container);

 //    createjs.Tween.get(this.container).to({alpha: 1}, 1000).call(function() {
 //    		self.isInited = true;

	// 		//once loaded and inited notify the game to remove the loading screen
 //    		goog.events.dispatchEvent(self, new goog.events.Event(EventNames.PANEL_LOAD_COMPLETE, self));
	// });

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
OptionsPanel.prototype.update = function() {
	var input = app.input;

	Panel.prototype.update.call(this);

	this.grid.update();

	this.inputOptions.update();

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

/**
*@override
*@protected
*/
OptionsPanel.prototype.onExit = function() {
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
					{ panelKey: PanelTypes.TITLE_PANEL }
				)
			);
		});
};