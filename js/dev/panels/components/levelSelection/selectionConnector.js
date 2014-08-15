goog.provide('SelectionConnector');

/**
*@constructor
*Pulsing connenctor that typically shows level selector routing
*/
SelectionConnector = function(width, rotation) {
	this.width = width || (Constants.UNIT * 1.5);

	this.rotation = rotation || 0;

	this.baseColor = Constants.WHITE;

	this.arrPulseColors = [Constants.BLUE, Constants.DARK_BLUE];

	this.container = null;

	this.base = null;

	this.pulse = null;

	this.pulseRate = 1.5;

	this.isActive = false;
	
	this.init();
};

/**
*@override
*@public
*/
SelectionConnector.prototype.init = function() {
	var pulseLength = Constants.UNIT * 0.5;

	this.container = new createjs.Container();
	this.container.rotation = this.rotation;

	this.base = new createjs.Shape();
	this.base.graphics
		.ss(8)
		.s(Constants.WHITE)
		.mt(0, 0)
		.lt(this.width, 0);

	this.pulse = new createjs.Shape();
	this.pulse.graphics
		.ss(8, "round")
		.ls([this.arrPulseColors[0], this.arrPulseColors[1]], [0.25, 1], 0, pulseLength, pulseLength, pulseLength)
		.mt(0, 0)
		.lt(pulseLength, 0);
	
	this.container.addChild(this.base);
	this.container.addChild(this.pulse);

	this.setIsActive(false);
};

/**
*@override
*@public
*/
SelectionConnector.prototype.update = function() {
	if(this.isActive) {
		this.pulse.x += this.pulseRate;

		if(this.pulse.x > this.width) {
			this.pulse.x = 0;
		}
	}
};

SelectionConnector.prototype.clear = function() {
	this.arrPulseColors = null;

	this.container.removeAllChildren();
	this.container = null;

	this.pulse.graphics.clear();
	this.pulse = null;

	this.base.graphics.clear();
	this.base = null;
};

/**
*@override
*@public
*/
SelectionConnector.prototype.setIsActive = function(value) {
	this.isActive = value;

	this.pulse.x = 0;
	this.isActive ? this.pulse.alpha = 0.45 : this.pulse.alpha = 0;
};


