goog.provide('OverdriveMeter');

goog.require('PlayerTank');

/**
*@constructor
*Energy meter displaying user's current level
*/
OverdriveMeter = function(w, h) {	
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

OverdriveMeter.MIN = 0;
OverdriveMeter.MAX = 0;

/**
*@public
*/
OverdriveMeter.prototype.init = function() {
	this.container = new createjs.Container();

	this.label = new createjs.Text("O", "16px AXI_Fixed_Caps_5x5", Constants.YELLOW);

	this.background = new createjs.Shape();
	this.background.x = app.charWidth * 2;
	this.background.y = 3;
	this.background.graphics
		.ss(1)
		.s(Constants.ORANGE)
		.f(Constants.DARK_RED)
		.dr(0, 0, this.width - this.background.x, this.height);

	this.meter = new createjs.Shape();
	this.meter.x = this.background.x + 2;
	this.meter.y = this.background.y + 4;

	OverdriveMeter.MAX = this.width - this.meter.x - 1;
	this.energy = 0;
	this.regenerationRate = OverdriveMeter.MAX / PlayerTank.MAX_OVERDRIVE;

	this.meter.graphics
		.ss(4)
		.s(Constants.YELLOW)
		.mt(0, 0)
		.lt(this.energy, 0);

	this.container.addChild(this.label);
	this.container.addChild(this.background);
	this.container.addChild(this.meter);
};

/**
*@public
*/
OverdriveMeter.prototype.update = function(options) {
	
};

/**
*@public
*/
OverdriveMeter.prototype.clear = function() {
	this.container.removeAllChildren();
	this.container = null;

	this.label = null;

	this.meter = null;
};

/**
*@public
*/
OverdriveMeter.prototype.changeEnergy = function(value) {
	this.energy = this.regenerationRate * value;

	//console.log("Energy MAX: " + OverdriveMeter.MAX);
	//console.log("Energy changing: " + this.energy);

	if(this.energy < OverdriveMeter.MIN) {
		this.energy = OverdriveMeter.MIN;
	} else if (this.energy > OverdriveMeter.MAX) {
		this.energy = OverdriveMeter.MAX
	}

	//adjust meter to reflect current level
	this.meter.graphics
 		.c()
		.ss(4)
		.s(Constants.YELLOW)
		.mt(0, 0)
		.lt(this.energy, 0);
};