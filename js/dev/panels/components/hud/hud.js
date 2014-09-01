goog.provide('Hud');

goog.require('Radar');
goog.require('WeaponSelectorContainer');
goog.require('PlayerMeterContainer');
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

	this.playerMeterContainer = null;

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
	this.container.addChild(this.playerMeterContainer.container);
	//this.container.addChild(this.energyMeter.container);
	//this.container.addChild(this.overdriveMeter.container);
	this.container.addChild(this.scoreComponent.container);
};

/**
*@public
*/
Hud.prototype.update = function(options) {
	this.radar.update(options);
	this.playerMeterContainer.update(options);
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

	this.playerMeterContainer.clear();
	this.playerMeterContainer = null;

	this.scoreComponent.clear();
	this.scoreComponent = null;
};

Hud.prototype.setMeters = function() {
	this.playerMeterContainer = new PlayerMeterContainer();
	this.playerMeterContainer.container.x = Constants.WIDTH * 0.5;
	this.playerMeterContainer.container.y = Constants.HEIGHT * 0.5;
};

Hud.prototype.setRadar = function(w, h, player, arrEnemySystems) {
	this.radar.setField(w, h, player, arrEnemySystems);
};

Hud.prototype.setSelection = function(index) {
	this.weaponSelectorContainer.setSelection(index);
};

Hud.prototype.changeEnergy = function(value) {
	this.playerMeterContainer.changeEnergy(value);
};

Hud.prototype.changeOverdrive = function(value) {
	this.playerMeterContainer.changeOverdrive(value);
};

Hud.prototype.modifyHealth = function(value) {
	this.playerMeterContainer.modifyHealth(value);
};

Hud.prototype.updateScore = function(value) {
	this.scoreComponent.updateScore(value);
};

Hud.prototype.updateBonus = function(value) {
	this.scoreComponent.updateBonus(value);
};