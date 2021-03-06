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

	this.inc = PlayerMeterContainer.INC;

	this.isAlive = false;
	this.isActive = false;

	this.activeTimer = 0;

	this.init();
};

PlayerMeterContainer.RADIUS = Constants.UNIT * 3;

PlayerMeterContainer.INC = 1 / 60;
PlayerMeterContainer.ACTIVE_DURATION = 45;

/**
*@public
*/
PlayerMeterContainer.prototype.init = function() {
	this.container = new createjs.Container();
	this.container.alpha = 0;

	this.healthMeter = new EnergyMeter(-150, -30, 
		[Constants.GREEN, Constants.DARK_GREEN, Constants.LIGHT_GREEN, Constants.BRIGHT_RED], 
		PlayerTank.MAX_HEALTH
	);

	this.energyMeter = new EnergyMeter(-30, 90, [Constants.BLUE, Constants.DARK_BLUE, Constants.LIGHT_BLUE, Constants.DARK_BLUE]);

	this.overdriveMeter = new EnergyMeter(90, 210, [Constants.ORANGE, Constants.DARK_RED, Constants.YELLOW, Constants.PLATINUM]);
	this.overdriveMeter.setMeter(0);

	this.container.addChild(this.healthMeter.container);
	this.container.addChild(this.energyMeter.container);
	this.container.addChild(this.overdriveMeter.container);

	this.isAlive = false;
	this.isActive = false;

	this.activeTimer = 0;
};

/**
*@public
*/
PlayerMeterContainer.prototype.update = function(options) {
	if(this.isAlive) {
		var target = options.target,
			camera = options.camera;

		//update to center about player's current position
		this.container.x = target.container.x + camera.position.x + target.hudOffset.x;
		this.container.y = target.container.y + camera.position.y + target.hudOffset.y;

		this.energyMeter.update(options);

		this.healthMeter.setIsPulsing(target.getIsHealthModified());
		this.healthMeter.update(options);

		this.overdriveMeter.setIsPulsing(target.getIsOverdrive());
		this.overdriveMeter.update(options);

		//active meter fades in and out, with a duration of pause, when any meter values are updated
		if(this.isActive) {
			if(this.container.alpha < 1) {
				this.container.alpha += PlayerMeterContainer.INC;
			} else {
				this.container.alpha = 1;
				
				this.activeTimer++;

				if(this.activeTimer > PlayerMeterContainer.ACTIVE_DURATION) {
					this.activeTimer = 0;
					this.isActive = false;
				}	
			}
		} else {
			if(this.container.alpha > 0) {
				this.container.alpha -= PlayerMeterContainer.INC;
			} else {
				this.isAlive = false;
			}
		}
	}
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
	(value.inc > 0) ? this.healthMeter.setPulseColor(Constants.PLATINUM) : this.healthMeter.setPulseColor(Constants.RED);

	this.healthMeter.setMeter(value.health);

	this.activate();
};

PlayerMeterContainer.prototype.changeEnergy = function (value) {
	this.energyMeter.setMeter(value);
	this.activate();
};

PlayerMeterContainer.prototype.changeOverdrive = function (value) {
	this.overdriveMeter.setMeter(value);
	this.activate();
};

PlayerMeterContainer.prototype.activate = function() {
	this.isAlive = this.isActive = true;
	this.activeTimer = 0;
};