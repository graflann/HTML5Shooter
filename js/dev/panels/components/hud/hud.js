goog.provide('Hud');

goog.require('Radar');
goog.require('WeaponSelectorContainer');
goog.require('EnergyMeter');
goog.require('OverdriveMeter');
goog.require('ScoreViewComponent');

/**
*@constructor
*Hud component
*/
Hud = function() {	
	/**
	*@type {Container}
	*/
	this.container = null;

	this.radar = null;

	this.weaponSelectorContainer = null;

	this.energyMeter = null;

	this.overdriveMeter = null;

	this.scoreComponent = null;

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
	this.weaponSelectorContainer.container.x = Constants.UNIT * 1.5;
	this.weaponSelectorContainer.container.y = (Constants.UNIT * 0.5) + 2;

	this.setMeters();

	this.scoreComponent = new ScoreViewComponent();
	this.scoreComponent.container.x = Constants.WIDTH * 0.5;
	this.scoreComponent.container.y = Constants.UNIT * 0.25;

	this.container.addChild(this.radar.container);
	this.container.addChild(this.radar.externalContainer);
	this.container.addChild(this.weaponSelectorContainer.container);
	this.container.addChild(this.energyMeter.container);
	this.container.addChild(this.overdriveMeter.container);
	this.container.addChild(this.scoreComponent.container);
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
	this.container = null;

	this.radar.clear();
	this.radar = null;

	this.weaponSelectorContainer.clear();
	this.weaponSelectorContainer = null;

	this.energyMeter.clear();
	this.energyMeter = null;

	this.overdriveMeter.clear();
	this.overdriveMeter = null;

	this.scoreComponent.clear();
	this.scoreComponent = null;
};

Hud.prototype.setMeters = function() {
	var width = this.weaponSelectorContainer.arrWeaponSelectors[0].width * 4;

	//Energy meter
	this.energyMeter = new EnergyMeter(
		width, 
		Constants.UNIT * 0.25
	);
	this.energyMeter.container.x = (Constants.WIDTH * 0.5) - (width * 0.5);
	this.energyMeter.container.y = Constants.UNIT * 2;

	//Overdrive meter
	this.overdriveMeter = new OverdriveMeter(
		this.energyMeter.width, 
		Constants.UNIT * 0.25
	);
	this.overdriveMeter.container.x = this.energyMeter.container.x;
	this.overdriveMeter.container.y = this.energyMeter.container.y + this.energyMeter.height + 8;
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

Hud.prototype.changeOverdrive = function(value) {
	this.overdriveMeter.changeEnergy(value);
};

Hud.prototype.updateScore = function(value) {
	this.scoreComponent.updateScore(value);
};

Hud.prototype.updateBonus = function(value) {
	this.scoreComponent.updateBonus(value);
};