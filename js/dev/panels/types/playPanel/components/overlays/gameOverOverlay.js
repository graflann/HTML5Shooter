goog.provide('GameOverOverlay');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');

/**
*@constructor
*/
GameOverOverlay = function(panel) {
	this.panel = panel;

	this.container = null;

	this.textContainer = null;

	this.background = null;

	this.gameText = null;

	this.overText = null;

	this.gameOptions = null;

	this.init();
};

goog.inherits(GameOverOverlay, goog.events.EventTarget);

/**
*@override
*@public
*/
GameOverOverlay.prototype.init = function() {
	this.container = new createjs.Container();

	this.textContainer = new createjs.Container();

	this.background = new createjs.Shape();
	this.background.graphics
		.lf([Constants.DARK_BLUE, Constants.BLACK], [0, 0.75], 0, 0, 0, Constants.HEIGHT)
		.dr(0, 0, Constants.WIDTH, Constants.HEIGHT);

	this.gameText = new createjs.Text(
		"game", 
		"16px AXI_Fixed_Caps_5x5", 
		Constants.BLUE
	);
	this.gameText.x = Constants.WIDTH * 0.5 - 44;
	this.gameText.y = Constants.HEIGHT * 0.33;
	this.gameText.scaleX = this.gameText.scaleY = 1.5;
	this.gameText.alpha = 0;

	this.overText = new createjs.Text(
		"over", 
		"16px AXI_Fixed_Caps_5x5", 
		Constants.LIGHT_BLUE
	);
	this.overText.x = this.gameText.x;
	this.overText.y = this.gameText.y;
	this.overText.scaleX = this.overText.scaleY = 1.5;
	this.overText.alpha = 0;

	this.gameOptions = new GameOptions(
		[
			new OptionText("restart level", PanelTypes.PLAY_PANEL),
			new OptionText("quit game", PanelTypes.TITLE_PANEL)
		]
	);
	this.gameOptions.container.x = (Constants.WIDTH * 0.5) - (this.gameOptions.width * 0.5);
	this.gameOptions.container.y = Constants.HEIGHT * 0.75;
	this.gameOptions.container.visible = false;

	this.textContainer.addChild(this.gameText);
	this.textContainer.addChild(this.overText);
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
GameOverOverlay.prototype.update = function() {
	if(this.gameOptions.container.visible) {
		this.gameOptions.update();
	}
};

GameOverOverlay.prototype.animate = function (callback) {
	var	self = this;

	createjs.Tween.get(this.container).to({ alpha: 1 }, 1000);

	createjs.Tween
		.get(this.gameText)
		.to({ 
			alpha: 1,
			x: (Constants.WIDTH * 0.5) - 88
		}, 2000);

	createjs.Tween
		.get(this.overText)
		.to({ 
			alpha: 1,
			x: (Constants.WIDTH * 0.5) + 12
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
GameOverOverlay.prototype.clear = function() {
	this.panel = null;

	this.container.removeAllChildren();
	this.textContainer.removeAllChildren();

	this.background.graphics.clear();
	this.background = null;

	this.gameText = null;
	this.overText = null;

	this.gameOptions.clear();
	this.gameOptions = null;

	this.textContainer = null;
	this.container = null;
};

GameOverOverlay.prototype.onOptionSelect = function(e) {
	var self = this;

	createjs.Sound.stop();

	createjs.Tween.get(this.textContainer)
		.to({ 
			alpha: 0
		}, 1000)
		.call(function () { self.endOptionSelect(e); });	
};

GameOverOverlay.prototype.endOptionSelect = function(e) {
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