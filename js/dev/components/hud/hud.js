goog.provide('Hud');

goog.require('Radar');
goog.require('WeaponSelectorContainer');

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

	this.container.addChild(this.radar.container);
	this.container.addChild(this.weaponSelectorContainer.container);
};

Hud.prototype.update = function(options) {
	this.radar.update(options);
};

/**
*@public
*/
Hud.prototype.clear = function() {
	this.container.removeAllChildren();

	this.weaponSelectorContainer.clear();
	this.weaponSelectorContainer = null;
};

Hud.prototype.setRadar = function(w, h, player, arrEnemySystems) {
	this.radar.setField(w, h, player, arrEnemySystems);
};

Hud.prototype.setSelection = function(index) {
	this.weaponSelectorContainer.setSelection(index);
};