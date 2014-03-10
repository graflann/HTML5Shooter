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

	this.bonus = null;
	
	this.init();
};

/**
*@public
*/
ScoreViewComponent.prototype.init = function() {
	this.container = new createjs.Container();

	this.score = new createjs.Text("0", "16px AXI_Fixed_Caps_5x5", Constants.LIGHT_BLUE);

	this.bonus = new createjs.Text("1" + ".0x", "16px AXI_Fixed_Caps_5x5", Constants.LIGHT_BLUE);
	this.bonus.y = 32;

	this.container.addChild(this.score);
	this.container.addChild(this.bonus);
};

/**
*@public
*/
ScoreViewComponent.prototype.updateScore = function(value) {
	this.score.text = value.toString();
};

/**
*@public
*/
ScoreViewComponent.prototype.updateBonus = function(value) {
	(value % 1 == 0) ? this.bonus.text = value.toString() + ".0x" : this.bonus.text = value.toString() + "x" ;
};

/**
*@public
*/
ScoreViewComponent.prototype.clear = function() {
	this.container.removeAllChildren();
	this.container = null;

	this.score = null;
	this.bonus = null;
};