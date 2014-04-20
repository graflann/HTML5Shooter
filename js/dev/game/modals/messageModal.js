goog.provide('MessageModal');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');

/**
*@constructor
*/
MessageModal = function(message) {
	this.message = message || "";

	this.container = null;

	this.background = null;

	this.messageBackground = null;

	this.messageText = null;

	this.init();
};

goog.inherits(MessageModal, goog.events.EventTarget);

/**
*@override
*@public
*/
MessageModal.prototype.init = function() {
	var w = Constants.WIDTH * 0.9,
		h = Constants.HEIGHT * 0.9;

	this.container = new createjs.Container();

	this.background = new createjs.Shape();
	this.background.graphics
		.lf([Constants.DARK_BLUE, Constants.BLACK], [0, 0.75], 0, 0, 0, Constants.HEIGHT)
		.dr(0, 0, Constants.WIDTH, Constants.HEIGHT);
	this.background.alpha = 0.5;

	this.messageBackground = new createjs.Shape();
	this.messageBackground.graphics
		.lf([Constants.BLACK, Constants.DARK_BLUE], [0, 0.75], 0, 0, 0, h)
		.dr(0, 0, w, h);
	this.messageBackground.x = (Constants.WIDTH - w) * 0.5;
	this.messageBackground.y = (Constants.HEIGHT - h) * 0.5;

	this.messageText = new createjs.Text(
		this.message, 
		"16px AXI_Fixed_Caps_5x5", 
		Constants.LIGHT_BLUE
	);
	this.messageText.lineWidth = w;
	this.messageText.textAlign = "center";
	this.messageText.x = this.messageBackground.x + (w * 0.5);
	this.messageText.y = this.messageBackground.y + (h * 0.5);

	this.container.addChild(this.background);
	this.container.addChild(this.messageBackground);
	this.container.addChild(this.messageText);
};

/**
*@override
*@protected
*/
MessageModal.prototype.update = function() {
	
};

MessageModal.prototype.setMessage = function(message) {
	this.message = this.messageText.text = message;
};

MessageModal.prototype.animate = function (callback) {
	var	self = this;
	this.container.alpha = 0;

	createjs.Tween.get(this.container).to({ alpha: 1 }, 500);
};

MessageModal.prototype.remove = function (callback) {
	createjs.Tween.get(this.container).to({ alpha: 0 }, 500).call(function() { callback(); });
};

/**
*@override
*@public
*/
MessageModal.prototype.clear = function() {
	this.container.removeAllChildren();

	this.background.graphics.clear();
	this.background = null;

	this.messageText = null;

	this.container = null;
};


MessageModal.prototype.endOptionSelect = function(e) {
	this.container.parent.removeChild(this.container);

	goog.events.dispatchEvent(
		this.panel, 
		new PayloadEvent(
			EventNames.PANEL_CHANGE, 
			this.panel,
			{ panelKey: e.target.panelKey }
		)
	);
};