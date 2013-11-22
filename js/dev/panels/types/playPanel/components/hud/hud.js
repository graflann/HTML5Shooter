goog.provide('Hud');

goog.require('Radar');
goog.require('WeaponSelectorContainer');
goog.require('EnergyMeter');

/**
*@constructor
*Hud component
*/
Hud = function() {	
	/**
	*@type {Shape}
	*/
	this.container = null;

	this.radar = null;

	this.weaponSelectorContainer = null;

	this.energyMeter = null;

	this.score = null;

	this.width = Constants.WIDTH;
	this.height = Constants.HEIGHT;
	
	this.init();
};

/**
*@public
*/
Hud.prototype.init = function() {
	this.container = new createjs.Container();

	this.radar = new Radar();
	this.weaponSelectorContainer = new WeaponSelectorContainer();

	this.energyMeter = new EnergyMeter(
		this.weaponSelectorContainer.arrWeaponSelectors[0].width * 4, 
		Constants.UNIT * 0.25
	);
	this.energyMeter.container.x = this.weaponSelectorContainer.arrWeaponSelectors[0].container.x;
	this.energyMeter.container.y = this.weaponSelectorContainer.container.y + 4;

	this.container.addChild(this.radar.container);
	this.container.addChild(this.weaponSelectorContainer.container);
	this.container.addChild(this.energyMeter.container);
};

/**
*@public
*/
Hud.prototype.update = function(options) {
	this.radar.update(options);
};

/**
*@public
*/
Hud.prototype.clear = function() {
	this.container.removeAllChildren();

	this.radar.clear();
	this.radar = null;

	this.weaponSelectorContainer.clear();
	this.weaponSelectorContainer = null;
};

Hud.prototype.setRadar = function(w, h, player, arrEnemySystems) {
	this.radar.setField(w, h, player, arrEnemySystems);
};

Hud.prototype.setSelection = function(index) {
	this.weaponSelectorContainer.setSelection(index);
};

Hud.prototype.changeEnergy = function(value) {
	this.energyMeter.changeEnergy(value);
};