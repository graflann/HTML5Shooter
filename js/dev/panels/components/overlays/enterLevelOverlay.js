goog.provide('EnterLevelOverlay');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');

/**
*@constructor
*/
EnterLevelOverlay = function(panel) {
	this.panel = panel;

	this.container = null;

	this.background = null;

	this.titleComponent = null;

	this.levelText = null;

	this.designationText = null;

	this.init();
};

goog.inherits(EnterLevelOverlay, goog.events.EventTarget);

/**
*@override
*@public
*/
EnterLevelOverlay.prototype.init = function() {
	this.container = new createjs.Container();

	this.background = new createjs.Shape();
	this.background.graphics
		.lf([Constants.DARK_BLUE, Constants.BLACK], [0, 0.75], 0, 0, 0, Constants.HEIGHT)
		.dr(0, 0, Constants.WIDTH, Constants.HEIGHT);

	this.levelText = new createjs.Text(
		"level", 
		"16px AXI_Fixed_Caps_5x5", 
		Constants.BLUE
	);
	this.levelText.x = Constants.WIDTH;
	this.levelText.y = Constants.HEIGHT * 0.5;
	this.levelText.alpha = 0;
	this.levelText.scaleX = this.levelText.scaleY = 1.5;

	this.designationText = new createjs.Text(
		"0X01", 
		"16px AXI_Fixed_Caps_5x5", 
		Constants.LIGHT_BLUE
	);
	this.designationText.x = Constants.WIDTH;
	this.designationText.y = (Constants.HEIGHT * 0.5);
	this.designationText.alpha = 0;
	this.designationText.scaleX = this.designationText.scaleY = 1.5;

	this.titleComponent = new createjs.Shape();
	this.titleComponent.graphics
		.ss(1)
		.s(Constants.RED)
		.lf([Constants.YELLOW, Constants.RED], [0, 0.75], 0, 0, 472, 0)
		.mt(0, 21)
		.lt(39, 0)
		.lt(472, 21)
		.lt(39, 41)
		.lt(0, 21);
	this.titleComponent.x = Constants.WIDTH * 1.5;
	this.titleComponent.y = (Constants.HEIGHT * 0.5) - 8;
	this.titleComponent.scaleX = 1.5;
	this.titleComponent.scaleY = 0.5;
	this.titleComponent.alpha = 1;

	this.container.addChild(this.background);
	this.container.addChild(this.titleComponent);
	this.container.addChild(this.levelText);
	this.container.addChild(this.designationText);
};

EnterLevelOverlay.prototype.animate = function (callback) {
	var	self = this,
		destX = Constants.WIDTH * 0.5;

	createjs.Tween.get(this.background).to({ alpha: 0 }, 4500);

	createjs.Tween.get(this.designationText)
    	.wait(350)
    	.to({ x: destX, alpha: 1 }, 2000);

    createjs.Tween.get(this.levelText)
    	.to({ x: destX - 32, alpha: 1 }, 2000)
    	.call(function() {
    		self.container.swapChildren(
    			self.container.getChildIndex(self.levelText), 
    			self.container.getChildIndex(self.designationText)
    		);

    		createjs.Tween.get(self.titleComponent)
				.to({ 
					x: -(Constants.WIDTH),
					alpha: 0.25,
					scaleY: 1,
					scaleY: 1
				}, 1000)

    		createjs.Tween.get(self.levelText)
    			.wait(500)
    			.to({ x: 0, alpha: 0 }, 2000);

    		createjs.Tween.get(self.designationText)
    			.to({ x: -32, alpha: 0 }, 2000)
    			.call(function() {
    				if(callback) {
    					callback();
    				}
    			});
    	});
};

/**
*@override
*@public
*/
EnterLevelOverlay.prototype.clear = function() {
	this.panel = null;

	this.container.removeAllChildren();

	this.background.graphics.clear();
	this.background = null;

	this.titleComponent.graphics.clear();
	this.titleComponent = null;

	this.levelText = null;
	this.designationText = null;

	this.container = null;
};