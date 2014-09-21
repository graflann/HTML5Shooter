goog.provide('WarningOverlay');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');

/**
*@constructor
*/
WarningOverlay = function(panel) {
	this.panel = panel;

	this.container = null;

	this.textContainer = null;

	this.background = null;

	this.textContainerBackground = null;

	this.warningBackground = null;

	this.warningText = null;

	this.strobeContainer = null;
	this.strobeText = null;

	this.enemyApproachingText = null;

	this.timer = null;

	this.endWarningEvent = new goog.events.Event(EventNames.END_WARNING, this);

	this.init();
};

goog.inherits(WarningOverlay, goog.events.EventTarget);

/**
*@override
*@public
*/
WarningOverlay.prototype.init = function() {
	this.container = new createjs.Container();

	this.textContainer = new createjs.Container();

	this.background = new createjs.Shape();
	this.background.graphics
		.lf([Constants.DARK_BLUE, Constants.BLACK], [0, 0.75], 0, 0, 0, Constants.HEIGHT)
		.dr(0, 0, Constants.WIDTH, Constants.HEIGHT);
	this.background.alpha = 0.25;

	this.setTextContainer();

	this.container.addChild(this.background);
	this.container.addChild(this.textContainer);
	this.container.alpha = 0;
};

/**
*@override
*@protected
*/
WarningOverlay.prototype.update = function() {
	
};

WarningOverlay.prototype.animate = function (callback) {
	var self = this;

	this.timer = setTimeout(
		function() {
			createjs.Tween
				.get(self.container)
				.to({ 
					alpha: 0
				}, 500)
				.call(
					function() {
						goog.events.dispatchEvent(self, self.endWarningEvent);
						clearTimeout(self.timer);
					}
				);
		}, 
		5000
	);

	createjs.Tween
		.get(this.container)
		.to({ 
			alpha: 1
		}, 500);

	createjs.Tween
		.get(this.strobeContainer, { loop:true })
		.to({ 
			x: this.strobeContainer.x - 8,
			y: this.strobeContainer.y - 8,
			alpha: 0.75
		}, 1000);

	this.strobeContainer.updateCache();

	createjs.Tween
		.get(this.enemyApproachingText, { loop:true })
		.to({ 
			x: -400
		}, 2500);
};

/**
*@override
*@public
*/
WarningOverlay.prototype.clear = function() {
	this.panel = null;

	createjs.Tween.removeAllTweens();

	this.timer = null;

	this.strobeContainer.uncache();
	this.strobeContainer.filters = null;

	this.container.removeAllChildren();
	this.textContainer.removeAllChildren();
	this.strobeContainer.removeAllChildren();

	this.background.graphics.clear();
	this.background = null;

	this.warningText = null;
	this.enemyApproachingText = null;

	this.strobeContainer = null;
	this.textContainer = null;
	this.container = null;
};

/**
*
*/
WarningOverlay.prototype.setTextContainer = function() {
	var w = Constants.WIDTH,
		h = Constants.HEIGHT * 0.25,
		strobeOffset = 4,
		textWidth = 656,
		textHeight = 100,
		blurFilter = new createjs.BoxBlurFilter(4, 4, 1),
		bounds = null;

	this.textContainerBackground = new createjs.Shape();
	this.textContainerBackground.graphics
		.lf([Constants.YELLOW, Constants.RED], [0, 0.5], 0, 0, w, 0)
		.dr(0, 0, w, h);
	this.textContainerBackground.alpha = 0.65;

	//base "warning" text
	this.warningText = new createjs.Text(
		"warning", 
		"16px AXI_Fixed_Caps_5x5", 
		Constants.DARK_BLUE
	);
	this.warningText.x = (w * 0.5) - (textWidth * 0.5);
	this.warningText.y = (h * 0.5) - 60;
	this.warningText.scaleX = this.warningText.scaleY = 8;
	this.warningText.alpha = 0.75;

	//blurred, red "warning" text that flashes red
	this.strobeText = new createjs.Text(
		"warning", 
		"16px AXI_Fixed_Caps_5x5", 
		Constants.PINK
	);
	this.strobeText.scaleX = this.strobeText.scaleY = 8;

	this.strobeContainer = new createjs.Container();
	this.strobeContainer.addChild(this.strobeText);

 	this.strobeContainer.filters = [blurFilter];
 	bounds = blurFilter.getBounds();

 	this.strobeContainer.cache(bounds.x, 0, 
 		textWidth + bounds.width, 
 		textHeight + bounds.height
 	);
 	this.strobeContainer.x = this.warningText.x;
	this.strobeContainer.y = this.warningText.y;
	this.strobeContainer.alpha = 0.25;

	//"large enemy approaching" scroll ticker from right to left
	this.enemyApproachingText = new createjs.Text(
		"large enemy approaching", 
		"16px AXI_Fixed_Caps_5x5", 
		Constants.DARK_RED
	);
	this.enemyApproachingText.x = w;
	this.enemyApproachingText.y = h * 0.8;
	this.enemyApproachingText.alpha = 0.75;
	this.enemyApproachingText.scaleX = this.enemyApproachingText.scaleY = 1.5;

	this.textContainer.addChild(this.textContainerBackground);
	this.textContainer.addChild(this.warningText);
	this.textContainer.addChild(this.strobeContainer);
	this.textContainer.addChild(this.enemyApproachingText);

	this.textContainer.y = (Constants.HEIGHT * 0.5) - (h * 0.5);
};