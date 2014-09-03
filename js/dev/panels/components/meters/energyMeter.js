goog.provide('EnergyMeter');

goog.require('PlayerTank');

/**
*@constructor
*Energy meter displaying user's current level
*/
EnergyMeter = function(startAngle, endAngle, arrColors, maxEnergyValue) {
	this.startAngle = Math.degToRad(startAngle);
	this.endAngle = Math.degToRad(endAngle);

	this.arrColors = arrColors;

	this.angleValue = Math.abs(startAngle - endAngle);

	this.maxEnergyValue = maxEnergyValue || PlayerTank.MAX_ENERGY;

	/**
	*@type {Container}
	*/
	this.container = null;

	this.background = null;

	this.border = null;

	this.meter = null;

	this.energy = 0;

	this.incValue = 0;
	
	this.init();
};

/**
*@public
*/
EnergyMeter.prototype.init = function() {
	this.container = new createjs.Container();

	this.border = new createjs.Shape();
	this.border.graphics
		.ss(6)
		.s(this.arrColors[0])
		.a(0, 0, PlayerMeterContainer.RADIUS, this.startAngle, this.endAngle);

	this.background = new createjs.Shape();
	this.background.graphics
		.ss(4)
		.s(this.arrColors[1])
		.a(0, 0, PlayerMeterContainer.RADIUS, this.startAngle, this.endAngle);

	this.meter = new createjs.Shape();
	this.meter.graphics
		.ss(2)
		.s(this.arrColors[2])
		.a(0, 0, PlayerMeterContainer.RADIUS, this.startAngle, this.endAngle);

	this.energy = this.angleValue;
	this.incValue = this.angleValue / this.maxEnergyValue;

	this.container.addChild(this.border);
	this.container.addChild(this.background);
	this.container.addChild(this.meter);
};

/**
*@public
*/
EnergyMeter.prototype.update = function(options) {
	
};

/**
*@public
*/
EnergyMeter.prototype.clear = function() {
	this.container.removeAllChildren();
	this.container = null;

	this.background = null;
	this.border = null;
	this.meter = null;
};

/**
*@public
*/
EnergyMeter.prototype.setMeter = function(value) {
	this.energy = this.incValue * value;

	if(this.energy < 0) {
		this.energy = 0;
	} else if (this.energy > this.angleValue) {
		this.energy = this.angleValue;
	}

	//adjust meter to reflect current level
	this.meter.graphics
 		.c()
		.ss(2)
		.s(this.arrColors[2])
		.a(0, 0, PlayerMeterContainer.RADIUS, this.startAngle, this.startAngle + Math.degToRad(this.energy));
};