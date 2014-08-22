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

	this.width = iconSpriteSheet._frames[0].rect.width + 4;
	this.height = iconSpriteSheet._frames[0].rect.height + 4;

	this.background = new createjs.Shape();

	this.icon = new createjs.BitmapAnimation(iconSpriteSheet);
	this.icon.x = 2;
	this.icon.y = 2;
	this.icon.gotoAndStop(0);

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

	this.icon = null;
};

/**
*@public
*/
WeaponSelector.prototype.setSelection = function(value) {
	this.isSelected = value;

	this.background.graphics.clear();

	if(this.isSelected) {
		this.background.graphics
			.ss(2)
			.s(Constants.LIGHT_BLUE)
			.lf([Constants.BLUE, Constants.DARK_BLUE], [0, 1], 0, 0, this.width, 0)
			.dr(0, 0, this.width, this.height);
	} else {
		this.background.graphics
			.ss(1)
			.s(Constants.BLUE)
			.lf([Constants.DARK_BLUE, Constants.BLUE], [0.75, 1], 0, 0, this.width, 0)
			.dr(0, 0, this.width, this.height);
	}
};