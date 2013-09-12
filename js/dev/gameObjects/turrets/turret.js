goog.provide('Turret');

goog.require('GameObject');
goog.require('KeyCode');
goog.require('GamepadCode');
goog.require('InputConfig');

/**
*@constructor
*Main turret/cannon used in play
*/
Turret = function(color, projectileSystem, hasAI) {
	/**
	*@type  {String}
	*/
	this.color = color;
	
	/**
	*@type {ProjectileSystem}
	*/
	this.projectileSystem = projectileSystem;
	
	/**
	*@type  {Boolean}
	*/
	this.hasAI = (hasAI != null || hasAI != undefined) ? hasAI : false; 
	
	/**
	*@type {Shape}
	*/
	this.shape;

	this.fireThreshold = 0;

	this.fireCounter = 0;

	this.isFiring = false;
	
	/**
	*@type {Shape}
	*/
	this.ammoDistance = 32 / app.physicsScale;
};

goog.inherits(Turret, GameObject);

/**
*@override
*@public
*/
Turret.prototype.init = function() {

};

/**
*@override
*@public				
*/
Turret.prototype.update = function(options) {	
	if(this.hasAI) {
		this.aiControl(options);
	} else {
		this.manualControl(options);
	}
};

/**
*@override
*@public
*/
Turret.prototype.clear = function() {
	this.shape.stage.removeChild(this.shape);
	
	this.shape = null;
};

Turret.prototype.manualControl = function(options) {
	var input = app.input,
		gamepad = input.gamepad;

	//always update fire delay
	this.fireCounter++;

	//rotate counter clock-wise
	if(input.isKeyDown(KeyCode.LEFT) || 
		input.isButtonDown(input.config[InputConfig.BUTTONS.ROTATE_LEFT])) /*||
		input.isButtonDown(GamepadCode.BUTTONS.X))*/ {
		this.shape.rotation -= 5;
	}
	
	//rotate clock-wise
	if(input.isKeyDown(KeyCode.RIGHT) || 
		input.isButtonDown(input.config[InputConfig.BUTTONS.ROTATE_RIGHT])) /*||
		input.isButtonDown(GamepadCode.BUTTONS.B))*/ {
		this.shape.rotation += 5;
	}
	
	//fire if PlayerTank is not transitioning Turret instances
	if(!options.isTransitioning) {
		if(input.isKeyDown(KeyCode.SPACE) || 
			input.isButtonDown(input.config[InputConfig.BUTTONS.SHOOT])) {
			if(this.fireCounter > this.fireThreshold) {
				this.fire();
				this.fireCounter = 0;
			}

			this.isFiring = true;
		} else {
			this.isFiring = false;
		}
	}

	//needed for press once
	// input.checkPrevKeyDown([
	// 	KeyCode.SPACE
	// ]);

	// input.checkPrevButtonDown([
	// 	GamepadCode.BUTTONS.A,
	// 	GamepadCode.BUTTONS.RT
	// ]);
};

Turret.prototype.aiControl = function(options) {
	var target = options.target,
		rad = Math.atan2(
			target.y - (this.shape.parent.y + this.shape.x), 
			target.x - (this.shape.parent.x  + this.shape.y)
		),
		deg = Math.radToDeg(rad) + 90;

	this.shape.rotation = deg;

	if(this.fireCounter++ > this.fireThreshold){
		this.fire();
		this.fireCounter = 0;
	}
};

Turret.prototype.nestedControl = function(options) {
	var target = options.target,
		rad = 0,
		deg = 0,
		localToGlobal = null;

	localToGlobal = this.shape.parent.localToGlobal(this.shape.x, this.shape.y);
	//localToGlobal = new app.b2Vec2(this.shape.x, this.shape.y);

	//console.log(localToGlobal);

	rad = Math.atan2(
		target.y - localToGlobal.x, 
		target.x - localToGlobal.y
	);

	deg = Math.radToDeg(rad) + 90;

	this.shape.rotation = this.shape.parent.rotation + 90;// - deg;

	if(this.fireCounter++ > this.fireThreshold){
		this.fire();
		this.fireCounter = 0;
	}
};

Turret.prototype.fire = function(){
	
};