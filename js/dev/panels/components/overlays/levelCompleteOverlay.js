goog.provide('LevelCompleteOverlay');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');

/**
*@constructor
*/
LevelCompleteOverlay = function(panel) {
	this.panel = panel;

	this.container = null;

	this.textContainer = null;

	this.background = null;

	this.levelText = null;

	this.completeText = null;

	this.scoreText = null;

	this.gameOptions = null;

	this.init();
};

goog.inherits(LevelCompleteOverlay, goog.events.EventTarget);

/**
*@override
*@public
*/
LevelCompleteOverlay.prototype.init = function() {
	this.container = new createjs.Container();

	this.textContainer = new createjs.Container();

	this.background = new createjs.Shape();
	this.background.graphics
		.lf([Constants.DARK_BLUE, Constants.BLACK], [0, 0.75], 0, 0, 0, Constants.HEIGHT)
		.dr(0, 0, Constants.WIDTH, Constants.HEIGHT);

	this.levelText = new createjs.Text(
		"level", 
		"16px AXI_Fixed_Caps_5x5", 
		Constants.BLUE
	);
	this.levelText.x = Constants.WIDTH * 0.5 - 86;
	this.levelText.y = Constants.HEIGHT * 0.33;
	this.levelText.scaleX = this.levelText.scaleY = 1.5;
	this.levelText.alpha = 0;

	this.completeText = new createjs.Text(
		"complete", 
		"16px AXI_Fixed_Caps_5x5", 
		Constants.LIGHT_BLUE
	);
	this.completeText.x = this.levelText.x;
	this.completeText.y = this.levelText.y;
	this.completeText.scaleX = this.completeText.scaleY = 1.5;
	this.completeText.alpha = 0;

	this.scoreText = new createjs.Text(app.scoreManager.getScore(), "16px AXI_Fixed_Caps_5x5", Constants.LIGHT_BLUE); 
	this.scoreText.x = (Constants.WIDTH * 0.5);
	this.scoreText.y = this.completeText.y + (Constants.UNIT * 2);
	this.scoreText.textAlign = "center";

	this.gameOptions = new GameOptions(
		[
			new OptionText("restart level", PanelTypes.PLAY_PANEL),
			new OptionText("quit game", PanelTypes.TITLE_PANEL)
		]
	);
	this.gameOptions.container.x = (Constants.WIDTH * 0.5) - (this.gameOptions.width * 0.5);
	this.gameOptions.container.y = Constants.HEIGHT * 0.75;
	this.gameOptions.container.visible = false;

	this.textContainer.addChild(this.levelText);
	this.textContainer.addChild(this.completeText);
	this.textContainer.addChild(this.scoreText);
	this.textContainer.addChild(this.gameOptions.container);

	this.container.addChild(this.background);
	this.container.addChild(this.textContainer);
	this.container.alpha = 0;

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
LevelCompleteOverlay.prototype.update = function() {
	if(this.gameOptions.container.visible) {
		this.gameOptions.update();
	}
};

LevelCompleteOverlay.prototype.animate = function (callback) {
	var	self = this;

	createjs.Tween.get(this.container).to({ alpha: 1 }, 1000);

	createjs.Tween
		.get(this.levelText)
		.to({ 
			alpha: 1,
			x: (Constants.WIDTH * 0.5) - 126
		}, 2000);

	createjs.Tween
		.get(this.completeText)
		.to({ 
			alpha: 1,
			x: (Constants.WIDTH * 0.5) - 26
		}, 2000)
		.call(function() {
			self.gameOptions.container.visible = true;

			if(callback) {
				callback();
			}
		});
};

/**
*@override
*@public
*/
LevelCompleteOverlay.prototype.clear = function() {
	this.panel = null;

	this.container.removeAllChildren();
	this.textContainer.removeAllChildren();

	this.background.graphics.clear();
	this.background = null;

	this.gameText = null;
	this.overText = null;
	this.scoreText = null;

	this.gameOptions.clear();
	this.gameOptions = null;

	this.textContainer = null;
	this.container = null;
};

LevelCompleteOverlay.prototype.onOptionSelect = function(e) {
	var self = this;

	createjs.Sound.stop();

	createjs.Tween.get(this.textContainer)
		.to({ 
			alpha: 0
		}, 1000)
		.call(function () { self.endOptionSelect(e); });	
};

LevelCompleteOverlay.prototype.endOptionSelect = function(e) {
	this.panel.isInited = false;

	this.container.parent.removeChild(this.container);

	goog.events.unlisten(
		this.gameOptions, 
		EventNames.OPTION_SELECT, 
		this.onOptionSelect, 
		false, 
		this
	);

	goog.events.dispatchEvent(
		this.panel, 
		new PayloadEvent(
			EventNames.PANEL_CHANGE, 
			this.panel,
			{ panelKey: e.target.panelKey }
		)
	);
};