goog.provide('PlayerMeterContainer');

goog.require('EnergyMeter');

/**
*@constructor
*Energy meter displaying user's current level
*/
PlayerMeterContainer = function() {	
	/**
	*@type {Container}
	*/
	this.container = null;

	this.healthMeter = null;
	this.energyMeter = null;
	this.overdriveMeter = null;

	this.init();
};

PlayerMeterContainer.RADIUS = Constants.UNIT * 3;

/**
*@public
*/
PlayerMeterContainer.prototype.init = function() {
	this.container = new createjs.Container();
	//this.container.alpha = 0.25;

	this.healthMeter = new EnergyMeter(-150, -30, [Constants.GREEN, Constants.DARK_GREEN, Constants.LIGHT_GREEN]);

	this.energyMeter = new EnergyMeter(-30, 90, [Constants.BLUE, Constants.DARK_BLUE, Constants.LIGHT_BLUE]);

	this.overdriveMeter = new EnergyMeter(90, 210, [Constants.ORANGE, Constants.DARK_RED, Constants.YELLOW]);
	this.overdriveMeter.changeEnergy(0);

	this.container.addChild(this.healthMeter.container);
	this.container.addChild(this.energyMeter.container);
	this.container.addChild(this.overdriveMeter.container);
};

/**
*@public
*/
PlayerMeterContainer.prototype.update = function(options) {
	
};

/**
*@public
*/
PlayerMeterContainer.prototype.clear = function() {
	this.container.removeAllChildren();
	this.container = null;

	this.healthMeter.clear();
	this.healthMeter = null;

	this.energyMeter.clear();
	this.energyMeter = null;

	this.overdriveMeter.clear();
	this.overdriveMeter = null;
};

PlayerMeterContainer.prototype.modifyHealth = function (value) {
	this.healthMeter.changeEnergy(value);
};

PlayerMeterContainer.prototype.changeEnergy = function (value) {
	this.energyMeter.changeEnergy(value);
};

PlayerMeterContainer.prototype.changeOverdrive = function (value) {
	this.overdriveMeter.changeEnergy(value);
};