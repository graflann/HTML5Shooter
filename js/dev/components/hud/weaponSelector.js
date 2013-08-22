goog.provide('WeaponSelector');

/**
*@constructor
*WeaponSelector component
*/
WeaponSelector = function(name)
{	
	this.name = name.toString();

	/**
	*@type {Shape}
	*/
	this.container = null;

	/**
	*@type {Shape}
	*/
	this.background = null;

	this.text = null;

	this.charWidth = 6;

	this.width = 0;
	this.height = 0;

	isSelected = false;
	
	this.init();
};

/**
*@public
*/
WeaponSelector.prototype.init = function() {
	this.container = new createjs.Container();

	this.width = (Constants.WIDTH / 5);
	this.height = (Constants.UNIT - 12);

	this.background = new createjs.Shape();

	this.text = new createjs.Text(this.name, "16px AXI_Fixed_Caps_5x5", Constants.DARK_BLUE);
	this.text.x = (this.width * 0.5) - (this.name.length * this.charWidth);
	this.text.y = 3;

	this.container.addChild(this.background);
	this.container.addChild(this.text);
	
	this.setSelection(false);
};

/**
*@public
*/
WeaponSelector.prototype.clear = function() {
	this.background.getStage().removeChild(this.background);
	
	this.background = null;
};

/**
*@public
*/
WeaponSelector.prototype.setSelection = function(value) {
	this.isSelected = value;

	if(this.isSelected) {
		this.background.graphics
			.ss(1)
			.s(Constants.DARK_BLUE)
			.lf([Constants.LIGHT_BLUE, Constants.BLUE], [0, 1], 0, 0, this.width, 0)
			.dr(0, 0, this.width, this.height);

		this.text.color = Constants.BLACK;
	} else {
		this.background.graphics
			.ss(1)
			.s(Constants.LIGHT_BLUE)
			.lf([Constants.DARK_BLUE, Constants.BLUE], [0.75, 1], 0, 0, this.width, 0)
			.dr(0, 0, this.width, this.height);

		this.text.color = Constants.BLUE;
	}
};