goog.provide('WeaponSelectorContainer');

goog.require('WeaponSelector');
goog.require('WeaponTypes');
goog.require('WeaponMap');

/**
*@constructor
*WeaponSelectorContainer component
*/
WeaponSelectorContainer = function() {	
	/**
	*@type {Shape}
	*/
	this.container = null;

	/**
	*@type {Shape}
	*/
	this.background = null;

	this.arrWeaponSelectors = [];

	this.currentWeaponIndex = 0;

	this.width = 0;
	this.height = 0;
	
	this.init();
};

/**
*@public
*/
WeaponSelectorContainer.prototype.init = function() {
	var i = 0,
		key,
		weaponSelector;

	this.container = new createjs.Container();

	this.width = Constants.WIDTH;
	this.height = Constants.UNIT + (Constants.UNIT * 0.5);

	this.background = new createjs.Shape();
	this.background.graphics
		.ss(1)
		.s(Constants.LIGHT_BLUE)
		.f(Constants.BLACK)
		.dr(0, 0, this.width, this.height);

	this.background.alpha = 0.5;

	this.container.addChild(this.background);

	for(key in WeaponTypes) {
		weaponSelector = new WeaponSelector(WeaponTypes[key]);

		weaponSelector.container.x = (Constants.WIDTH * 0.1) + i * weaponSelector.width;
		weaponSelector.container.y = (Constants.UNIT * 0.5) + 6;

		this.arrWeaponSelectors[i] = weaponSelector;

		this.container.addChild(weaponSelector.container);

		i++;
	}

	this.container.y = Constants.HEIGHT - this.height;

	this.setSelection(this.currentWeaponIndex);
};

/**
*@public
*/
WeaponSelectorContainer.prototype.clear = function() {
	this.background.getStage().removeChild(this.background);
	
	this.background = null;
};

WeaponSelectorContainer.prototype.setSelection = function(index) {
	var weaponSelector = null;

	//turn existing selection off
	this.arrWeaponSelectors[this.currentWeaponIndex].setSelection(false);

	//acquire and turn on new selection
	this.currentWeaponIndex = index;
	weaponSelector = this.arrWeaponSelectors[this.currentWeaponIndex];
	weaponSelector.setSelection(true);

	//ensure the current weapon selector is placed on top
	this.container.removeChild(weaponSelector.container);
	this.container.addChild(weaponSelector.container);

	//fades the selector in
	weaponSelector.container.alpha = 0;
	createjs.Tween.get(weaponSelector.container).to({alpha: 1}, 350);
};