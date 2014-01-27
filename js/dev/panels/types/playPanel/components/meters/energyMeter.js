goog.provide('EnergyMeter');

goog.require('PlayerTank');

/**
*@constructor
*Energy meter displaying user's current level
*/
EnergyMeter = function(w, h) {	
	this.width = w;
	this.height = h;

	/**
	*@type {Container}
	*/
	this.container = null;

	this.label = null;

	this.meter = null;

	this.energy = 0;

	this.regenerationRate = 0;
	
	this.init();
};

EnergyMeter.MIN = 0;
EnergyMeter.MAX = 0;

/**
*@public
*/
EnergyMeter.prototype.init = function() {
	this.container = new createjs.Container();

	this.label = new createjs.Text("E", "16px AXI_Fixed_Caps_5x5", Constants.LIGHT_BLUE);

	this.background = new createjs.Shape();
	this.background.x = app.charWidth * 2;
	this.background.y = 3;
	this.background.graphics
		.ss(1)
		.s(Constants.BLUE)
		.f(Constants.DARK_BLUE)
		.dr(0, 0, this.width - this.background.x, this.height);

	this.meter = new createjs.Shape();
	this.meter.x = this.background.x + 2;
	this.meter.y = this.background.y + 4;

	EnergyMeter.MAX = this.width - this.meter.x - 1;
	this.energy = EnergyMeter.MAX;
	this.regenerationRate = EnergyMeter.MAX / PlayerTank.MAX_ENERGY;

	this.meter.graphics
		.ss(4)
		.s(Constants.LIGHT_BLUE)
		.mt(0, 0)
		.lt(this.energy, 0);

	this.container.addChild(this.label);
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
};

/**
*@public
*/
EnergyMeter.prototype.changeEnergy = function(value) {
	this.energy = this.regenerationRate * value;

	//console.log("Energy MAX: " + EnergyMeter.MAX);
	//console.log("Energy changing: " + this.energy);

	if(this.energy < EnergyMeter.MIN) {
		this.energy = EnergyMeter.MIN;
	} else if (this.energy > EnergyMeter.MAX) {
		this.energy = EnergyMeter.MAX
	}

	//adjust meter to reflect current level
	this.meter.graphics
 		.c()
		.ss(4)
		.s(Constants.LIGHT_BLUE)
		.mt(0, 0)
		.lt(this.energy, 0);
};