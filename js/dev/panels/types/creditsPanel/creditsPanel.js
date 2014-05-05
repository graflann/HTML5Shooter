goog.provide('CreditsPanel');

goog.require('Panel');

/**
*@constructor
*/
CreditsPanel = function() {
	Panel.call(this);

	this.container = null;

	this.background = null;

	this.grid = null;

	this.creditsTitleText = null;

	this.creditsText = null;

	this.exitText = null;

	this.init();
};

goog.inherits(CreditsPanel, Panel);

/**
*@override
*@public
*/
CreditsPanel.prototype.init = function() {
	var self = this,
		stage = app.layers.getStage(LayerTypes.MAIN),
		exitLabel = "press b to exit";

	this.container = new createjs.Container();
	//this.container.alpha = 0;

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

	this.creditsTitleText = new createjs.Text(
		"Credits", 
		"16px AXI_Fixed_Caps_5x5", 
		Constants.BLUE
	);
	this.creditsTitleText.textAlign = "center";
	this.creditsTitleText.x = Constants.WIDTH * 0.5;
	this.creditsTitleText.y = Constants.UNIT * 3;
	this.creditsTitleText.scaleX = this.creditsTitleText.scaleY = 1.5;

	this.creditsText = new createjs.Text(
		"Grant Flannery: Programming and Design\n\n" + 
		"Mark Statkus @ Cybercussion Interactive: Music and Sound FX\n" +
		"http://www.cybercussion.com\n\n" +
		"Additional sound FX: http://www.freesfx.co.uk\n\n" + 
		"STRIKE (C) 2014 GRANT FLANNERY",
		"16px AXI_Fixed_Caps_5x5",
		Constants.LIGHT_BLUE
	);
	this.creditsText.x = Constants.UNIT * 4;
	this.creditsText.y = this.creditsTitleText.y + 64;

	this.exitText = new createjs.Text(
		exitLabel, 
		"16px AXI_Fixed_Caps_5x5", 
		Constants.RED
	);
	this.exitText.textAlign = "center";
	this.exitText.x = this.creditsTitleText.x;
	this.exitText.y = Constants.HEIGHT * 0.5;

    this.container.addChild(this.grid.shape);
	this.container.addChild(this.creditsTitleText);
	this.container.addChild(this.creditsText);
	this.container.addChild(this.exitText);

	stage.addChild(this.background);
    stage.addChild(this.container);

 //    createjs.Tween.get(this.container).to({alpha: 1}, 2000).call(function() {
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
CreditsPanel.prototype.update = function() {
	var input = app.input;

	Panel.prototype.update.call(this);

	this.grid.update();

	if(input.isButtonPressedOnce(GamepadCode.BUTTONS.B)) {
		this.onExit();
	}
};

/**
*@override
*@public
*/
CreditsPanel.prototype.clear = function() {
	this.panel = null;

	this.container.removeAllChildren();

	this.background.graphics.clear();
	this.background = null;

	this.creditsTitleText = null;
	this.creditsText = null;
	this.exitText = null;

	this.container = null;
};

/**
*@override
*@protected
*/
CreditsPanel.prototype.onExit = function() {
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