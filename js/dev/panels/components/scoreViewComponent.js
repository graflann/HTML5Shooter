goog.provide('ScoreViewComponent');

/**
*@constructor
*Energy meter displaying user's current level
*/
ScoreViewComponent = function() {	
	/**
	*@type {Container}
	*/
	this.container = null;

	this.score = null;
	this.scoreOverlay = null;

	this.bonus = null;
	this.bonusOverlay = null;
	
	this.init();
};

/**
*@public
*/
ScoreViewComponent.prototype.init = function() {
	this.container = new createjs.Container();

	this.score = new createjs.Text("0", "16px AXI_Fixed_Caps_5x5", Constants.LIGHT_BLUE);
	this.score.textAlign = "center";

	this.scoreOverlay = new createjs.Text("0", "16px AXI_Fixed_Caps_5x5", Constants.DARK_BLUE);
	this.scoreOverlay.y = this.score.y;
	this.scoreOverlay.textAlign = "center";
	this.scoreOverlay.alpha = 0;

	this.bonus = new createjs.Text("1" + ".0x", "16px AXI_Fixed_Caps_5x5", Constants.YELLOW);
	this.bonus.y = Constants.UNIT * 0.75;
	this.bonus.textAlign = "center";

	this.bonusOverlay = new createjs.Text("1" + ".0x", "16px AXI_Fixed_Caps_5x5", Constants.DARK_RED);
	this.bonusOverlay.y = this.bonus.y;
	this.bonusOverlay.textAlign = "center";
	this.bonusOverlay.alpha = 0;

	this.container.addChild(this.score);
	this.container.addChild(this.scoreOverlay);
	this.container.addChild(this.bonus);
	this.container.addChild(this.bonusOverlay);
};

/**
*@public
*/
ScoreViewComponent.prototype.updateScore = function(value) {
	this.score.text = value.toString();
	this.scoreOverlay.text = this.score.text;
	this.scoreOverlay.alpha = 1;

	createjs.Tween.get(this.scoreOverlay).to({ alpha: 0 }, 500);
};

/**
*@public
*/
ScoreViewComponent.prototype.updateBonus = function(value) {
	(value % 1 == 0) ? this.bonus.text = value.toString() + ".0x" : this.bonus.text = value.toString() + "x";

	if(value == 10) {
		this.bonus.text = "MAX " + this.bonus.text;
	}

	this.bonusOverlay.text = this.bonus.text;
	this.bonusOverlay.alpha = 1;

	createjs.Tween.get(this.bonusOverlay).to({ alpha: 0 }, 500);
};

/**
*@public
*/
ScoreViewComponent.prototype.clear = function() {
	this.container.removeAllChildren();
	this.container = null;

	this.score = null;
	this.scoreOverlay = null;
	this.bonus = null;
	this.bonusOverlay = null;
};