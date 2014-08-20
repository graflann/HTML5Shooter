goog.provide('WeaponSelector');

/**
*@constructor
*WeaponSelector component
*/
WeaponSelector = function(name) {	
	this.name = name.toLowerCase();

	/**
	*@type {createjs.Container}
	*/
	this.container = null;

	/**
	*@type {createjs.Shape}
	*/
	this.background = null;

	this.icon = null;

	//this.text = null;

	this.width = 0;
	this.height = 0;

	isSelected = false;
	
	this.init();
};

/**
*@public
*/
WeaponSelector.prototype.init = function() {
	var iconSpriteSheet = app.assetsProxy.arrSpriteSheet[this.name + "Icon"];

	this.container = new createjs.Container();

	this.width = iconSpriteSheet._frames[0].rect.width;
	this.height = iconSpriteSheet._frames[0].rect.height;

	this.background = new createjs.Shape();

	this.icon = new createjs.BitmapAnimation(iconSpriteSheet);
	this.icon.gotoAndStop(0);

	// this.text = new createjs.Text(this.name, "16px AXI_Fixed_Caps_5x5", Constants.DARK_BLUE);
	// this.text.x = (this.width * 0.5) - (this.name.length * app.charWidth);
	// this.text.y = 3;

	this.container.addChild(this.background);
	this.container.addChild(this.icon);
	
	this.setSelection(false);
};

/**
*@public
*/
WeaponSelector.prototype.clear = function() {
	this.container.removeAllChildren();
	this.container = null;

	this.background.graphics.clear();
	this.background = null;

	//this.text = null;
	this.icon = null;
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
			.lf([Constants.BLUE, Constants.DARK_BLUE], [0, 1], 0, 0, this.width, 0)
			.dr(0, 0, this.width, this.height);

		//this.text.color = Constants.BLACK;
	} else {
		this.background.graphics
			.ss(1)
			.s(Constants.LIGHT_BLUE)
			.lf([Constants.DARK_BLUE, Constants.BLUE], [0.75, 1], 0, 0, this.width, 0)
			.dr(0, 0, this.width, this.height);

		//this.text.color = Constants.BLUE;
	}
};