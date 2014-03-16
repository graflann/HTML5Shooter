goog.provide('Turret');

goog.require('GameObject');
goog.require('KeyCode');
goog.require('GamepadCode');
goog.require('InputConfig');
goog.require('PayloadEvent');
goog.require('DefaultFireState');
goog.require('AlternativeFireState');
goog.require('RotationUtils');

/**
*@constructor
*Main turret/cannon used in play
*/
Turret = function(hasAI, arrProjectileSystems) {
	/**
	*@type {ProjectileSystem}
	*/
	this.arrProjectileSystems = arrProjectileSystems;

	/**
	*@type {ProjectileSystem}
	*/
	this.currentProjectileSystem = null;
	
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

	this.energyConsumption = 0;

	this.energyChangeEvent = new PayloadEvent(EventNames.ENERGY_CHANGE, this, this.energyConsumption);
	
	/**
	*@type {Shape}
	*/
	this.ammoDistance = 32 / app.physicsScale;

	this.controlType = null;

	this.firingState = null;

	/**
	*@type {Function}
	*/
	this.fire = null;

	this.intendedRotation = 0;

	this.rotationRate = 5;

	this.baseRotationDeg = 0;
};

goog.inherits(Turret, GameObject);

Turret.FIRE_TYPES = {
	DEFAULT: 0,
	ALT: 1
};

Turret.ROTATION_RATE = 5;

/**
*@override
*@public
*/
Turret.prototype.init = function() {
	if(this.hasAI) {
		this.controlType = this.aiControl;
	} else {
		this.controlType = this.manualControl;
	}
};

/**
*@override
*@public				
*/
Turret.prototype.update = function(options) {	
	this.controlType(options);
};

/**
*@override
*@public
*/
Turret.prototype.clear = function() {
	GameObject.prototype.clear.call(this);

	this.arrProjectileSystems = null;

	this.currentProjectileSystem = null;
	
	this.shape.graphics.clear();
	this.shape = null;

	this.energyChangeEvent = null;
};

Turret.prototype.manualControl = function(options) {
	var input = app.input,
		gamepad = input.gamepad,
		vert = input.getAxis(GamepadCode.AXES.RIGHT_STICK_VERT),
		hori = input.getAxis(GamepadCode.AXES.RIGHT_STICK_HOR);

	//always update fire delay
	this.fireCounter++;

	//rotate counter clock-wise
	if(input.isKeyDown(KeyCode.LEFT) || 
		input.isButtonDown(input.config[InputConfig.BUTTONS.ROTATE_LEFT])) /*||
		input.isButtonDown(GamepadCode.BUTTONS.X))*/ {
		this.shape.rotation -= Turret.ROTATION_RATE;
	}
	
	//rotate clock-wise
	if(input.isKeyDown(KeyCode.RIGHT) || 
		input.isButtonDown(input.config[InputConfig.BUTTONS.ROTATE_RIGHT])) /*||
		input.isButtonDown(GamepadCode.BUTTONS.B))*/ {
		this.shape.rotation += Turret.ROTATION_RATE;
	}
	
	//fire if PlayerTank is not transitioning Turret instances
	if(options.firingIsReady && options.energy !== 0) {
		//Keyboard or Button fire
		if(input.isKeyDown(KeyCode.SPACE) || 
			input.isButtonDown(input.config[InputConfig.BUTTONS.SHOOT])) {
			if(this.fireCounter > this.fireThreshold) {
				this.fire();
				this.fireCounter = 0;

				this.energyChangeEvent.payload = this.energyConsumption;
				goog.events.dispatchEvent(this, this.energyChangeEvent);
			}

			this.isFiring = true;
		} 
		//maps right-stick to turret rotation for firing control in twin-stick preference
		else if ( 
			vert < -input.SHOOT_THRESHOLD || vert > input.SHOOT_THRESHOLD ||
			hori < -input.SHOOT_THRESHOLD || hori > input.SHOOT_THRESHOLD
		) {
			var deg = Math.radToDeg(Math.atan2(vert, hori));

			//offset rotation
			this.shape.rotation = deg + 90;

			if(this.fireCounter > this.fireThreshold) {
				this.fire();
				this.fireCounter = 0;

				this.energyChangeEvent.payload = this.energyConsumption;
				goog.events.dispatchEvent(this, this.energyChangeEvent);
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
		);

	this.baseRotationDeg = Math.radToDeg(rad);

	RotationUtils.updateRotation(this, this.shape, 90);

	if(this.fireCounter++ > this.fireThreshold){
		this.fire();
		this.fireCounter = 0;
	}
};

Turret.prototype.defaultFire = function() {
	
};

Turret.prototype.altFire = function() {
	
};

/**
*@public				
*/
Turret.prototype.enterDefaultFire = function(options) {	
	this.fire = this.defaultFire;
};

/**
*@public				
*/
Turret.prototype.enterAltFire = function(options) {	
	this.fire = this.altFire;
};

/**
*@public				
*/
Turret.prototype.updateDefaultFire = function(options) {	
	
};

/**
*@public				
*/
Turret.prototype.updateAltFire = function(options) {	
	
};

/**
*@public				
*/
Turret.prototype.exitDefaultFire = function(options) {	
	
};

/**
*@public				
*/
Turret.prototype.exitAltFire = function(options) {	
	
};

/**
*@public				
*/
Turret.prototype.setFiringState = function(value) {
	this.firingState = value;

	this.currentProjectileSystem = this.arrProjectileSystems[this.firingState];

	if(this.firingState === Turret.FIRE_TYPES.DEFAULT) {
		this.stateMachine.setState(DefaultFireState.KEY);	
	} else {
		this.stateMachine.setState(AlternativeFireState.KEY);
	}
};

Turret.prototype.setStateMachine = function() {
	this.stateMachine = new StateMachine();

	this.stateMachine.addState(
		DefaultFireState.KEY,
		new DefaultFireState(this),
		[ AlternativeFireState.KEY ]
	);

	this.stateMachine.addState(
		AlternativeFireState.KEY,
		new AlternativeFireState(this),
		[ DefaultFireState.KEY ]
	);
	
	this.stateMachine.setState(DefaultFireState.KEY);
};