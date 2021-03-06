goog.provide('PlayerTank');

goog.require('GameObject');
goog.require('Turret');
goog.require('TurretClasses');
goog.require('TurretTypes');
goog.require('KeyCode');
goog.require('GamepadCode');
goog.require('MouseCode');
goog.require('InputConfig');
goog.require('WeaponMap');
goog.require('EventNames');
goog.require('StateMachine');
goog.require('PlayerDefaultState');
goog.require('PlayerBoostState');
goog.require('PlayerRechargeState');
goog.require('PlayerDeathState');
goog.require('PlayerOverdriveState');
goog.require('RotationUtils');

/**
*@constructor
*/
PlayerTank = function(arrProjectileSystems, boostSystem, parrySystem) {
	GameObject.call(this);

	/**
	 * @type {Array}
	 */
	this.arrProjectileSystems = arrProjectileSystems;

	/**
	 * @type {ParticleSystem}
	 */
	this.boostSystem = boostSystem;

	/**
	 * @type {ParticleSystem}
	 */
	this.parrySystem = parrySystem;
	
	/**
	*@type {ProjectileSystem}
	*/
	this.currentProjectileSystem = null;

	/**
	*@type {ProjectileSystem}
	*/
	this.homingProjectileSystem = null;

	this.currentTurretType = "";

	this.currentProjectileType = "";

	this.currentWeaponIndex = 0;

	this.prevWeaponIndex = 0;
	
	this.physicalPosition = null;

	this.body = null;

	this.turretBody = null;

	this.container = null;

	this.base = null;

	this.baseContainer = null;

	this.arrWheels = [];

	this.turret = null;

	this.turretTransition = null;

	this.turretTransitionAddAnimUtil = null;
	this.turretTransitionRemoveAnimUtil = null;

	this.turretTransitionRate = 500;

	this.arrTurrets = [];

	this.isHoming = false;

	this.intendedRotation = 0;

	this.rotationRate = 5;

	this.isMoving = false;

	this.isBoosting = false;

	this.isOverdrive = false;

	this.isTransitioning = false;

	this.isRecharging = false;

	this.homingInc = 0;
	
	this.totalHomingValue = 0;

	this.energy = 100;

	this.overdrive = 0;

	this.overdriveTimer = PlayerOverdriveState.DURATION;

	this.health = 0;
	this.isHealthModified = false;
	this.healthModificationTimer = 0;

	this.damage = 0;

	this.hudOffset = null;

	this.stateMachine = null;

	//cache events
	this.weaponSelectEvent 			= new goog.events.Event(EventNames.WEAPON_SELECT, this);
	this.addHomingOverlayEvent 		= new goog.events.Event(EventNames.ADD_HOMING_OVERLAY, this);
	this.removeHomingOverlayEvent 	= new goog.events.Event(EventNames.REMOVE_HOMING_OVERLAY, this);
	this.gameOverEvent 				= new goog.events.Event(EventNames.GAME_OVER, this);

	this.increaseHomingOverlayEvent = new PayloadEvent(EventNames.INCREASE_HOMING_OVERLAY, this, this.homingInc);
	this.energyChangeEvent 			= new PayloadEvent(EventNames.ENERGY_CHANGE, this, this.energy);
	this.overdriveChangeEvent 		= new PayloadEvent(EventNames.OVERDRIVE_CHANGE, this, this.overdrive);
	this.modifyHealthEvent 			= new PayloadEvent(EventNames.MODIFY_HEALTH, this, this.health);

	this.init();
};

goog.inherits(PlayerTank, GameObject);

PlayerTank.KEY = "player";

PlayerTank.HOMING_OFFSETS = [-150, 150, -120, 120];

PlayerTank.MAX_ENERGY 		= 100;
PlayerTank.MAX_OVERDRIVE 	= 100;

PlayerTank.BOOST_SCALE_X = 0.9;
PlayerTank.BOOST_SCALE_Y = 1.1;
PlayerTank.BOOST_ALPHA = 0.75;
PlayerTank.REQUIRED_FOR_BOOST = PlayerTank.MAX_ENERGY * 0.5;

PlayerTank.HOMING_INCREMENT = 2;
PlayerTank.HOMING_LIMIT = PlayerTank.MAX_ENERGY * 0.5;

PlayerTank.MAX_HEALTH = 8;
PlayerTank.HEALTH_MODIFICATION_LIMIT = 60;

/**
*@override
*@public
*/
PlayerTank.prototype.init = function() {
	var baseSpriteSheet = app.assetsProxy.arrSpriteSheet["striker"],
		wheelSpriteSheet = app.assetsProxy.arrSpriteSheet["strikerWheel"];

	this.container = new createjs.Container();

	this.width = 52;
	this.height = 67;

	this.velocity.x = this.velocity.y = 6400;

	this.health = PlayerTank.MAX_HEALTH;
	this.isHealthModified = false;
	this.healthModificationTimer = 0;

	this.prevWeaponIndex = this.currentWeaponIndex;

	this.baseContainer = new createjs.Container();

	this.base = new createjs.BitmapAnimation(baseSpriteSheet);
	this.base.gotoAndStop(0);
	this.baseContainer.x = this.baseContainer.regX = this.width * 0.5;
	this.baseContainer.y = this.baseContainer.regY = this.height * 0.75;
	this.baseContainer.addChild(this.base);

	this.arrWheels = [
		new createjs.BitmapAnimation(wheelSpriteSheet),
		new createjs.BitmapAnimation(wheelSpriteSheet)
	];
	this.arrWheels[0].x = 7; 	//left
	this.arrWheels[1].x = 44;	//right
	this.arrWheels[0].y = this.arrWheels[1].y = 7;

	for(var i = 0; i < this.arrWheels.length; i++) {
		this.arrWheels[i].regX = this.arrWheels[i].regY = 10;
		this.arrWheels[i].gotoAndStop(0);
		this.baseContainer.addChild(this.arrWheels[i]);
	}
	this.container.addChild(this.baseContainer);

	this.turretTransition = new createjs.BitmapAnimation(app.assetsProxy.arrSpriteSheet["turretTransition"]);
	this.turretTransition.regX = this.turretTransition.regY = 18;
	this.turretTransition.x = this.baseContainer.x;
	this.turretTransition.y = this.baseContainer.y;

	this.turretTransitionAddAnimUtil = new AnimationUtility("add", this.turretTransition, 8);
	this.turretTransitionRemoveAnimUtil = new AnimationUtility("remove", this.turretTransition, 8);

	this.setTurretMap();
	this.setTurret(TurretTypes.VULCAN, ProjectileTypes.VULCAN);

	this.homingProjectileSystem = this.arrProjectileSystems[ProjectileTypes.HOMING];

	this.position = new app.b2Vec2();
	this.physicalPosition = new app.b2Vec2();
	this.force = new app.b2Vec2();

	this.hudOffset = new app.b2Vec2(this.width * 0.5, this.width * 0.9);

	this.collisionRoutingObject = new CollisionRoutingObject();
	this.collisionRoutingObject.type = "player";

	this.setPhysics();

	this.setStateMachine();

	this.setIsAlive(true);
};

/**
*@override
*@public
*/
PlayerTank.prototype.update = function(options) {
	if(this.isAlive) {
		var input = app.input;

		//update current state
		this.stateMachine.update(options);

		//health timer gets a constant update
		this.updateHealthTimer();

		input.checkPrevKeyDown([
			KeyCode.Z, 		//switch
			KeyCode.X,		//boost
			KeyCode.SPACE	//reload
		]);

		input.checkPrevButtonDown([
			input.config[InputConfig.BUTTONS.SWITCH],
			input.config[InputConfig.BUTTONS.BOOST],
			input.config[InputConfig.BUTTONS.RELOAD]
		]);
	}
};

/**
*@public
*/
PlayerTank.prototype.updateDefault = function(options) {
	//zero out body's linear velocity
	this.body.SetLinearVelocity(app.vecZero);

	//increases at a determined rate continuously by default
	//this.updateEnergy();

	this.checkMovement();

	//Updates the base rotation with a smooth transition
	this.updateRotation();

	this.animateWheels();

	this.setPosition(this.body.GetPosition());

	this.updateHoming(options);

	this.checkTurretTransition();

	this.updateTurret(options);

	this.checkReload();

	this.checkBoost();
};

/**
*@public
*/
PlayerTank.prototype.enterBoost = function(options) {
	var self = this,
		rotation = this.baseContainer.rotation - 90,
		boostVelX = this.velocity.x * 2,
		boostVelY = this.velocity.y * 2,
		boostTweenRate = PlayerBoostState.DURATION * 0.5;

	this.force.x = boostVelX * app.trigTable.cos(rotation);
	this.force.y = boostVelY * app.trigTable.sin(rotation);

	this.body.ApplyForce(this.force, this.body.GetWorldCenter());
	this.transformBodySensor(true);

	this.isBoosting = true;

	this.isMoving = true;

	this.damage = 100;

	this.changeEnergy(this.energy - PlayerTank.REQUIRED_FOR_BOOST);

	this.boostSystem.emit(1, { target: this });

	createjs.Tween
		.get(this.baseContainer)
		.to({ 
				scaleX: PlayerTank.BOOST_SCALE_X,
				scaleY: PlayerTank.BOOST_SCALE_Y,
				alpha: PlayerTank.BOOST_ALPHA
			}, 
			boostTweenRate)
		.call(function(){
			createjs.Tween
				.get(self.baseContainer)
				.to({ 
						scaleX: 1,
						scaleY: 1,
						alpha: 1
					}, 
					boostTweenRate);
		});

	setTimeout(function() {
		if(self.energy === 0) {
			self.stateMachine.setState(PlayerRechargeState.KEY);
		} else {
			if(self.isOverdrive) {
				if(self.overdrive === 0) {
					//force an overdrive exit as the tank is in a boost state
					//then set back to a default state as overdrive has expired
					self.exitOverdrive();
					self.stateMachine.setState(PlayerDefaultState.KEY);
				} else {
					self.stateMachine.setState(PlayerOverdriveState.KEY);
				}
			} else {
				self.stateMachine.setState(PlayerDefaultState.KEY);
			}
		}
	}, PlayerBoostState.DURATION);
};

/**
*@public
*/
PlayerTank.prototype.updateBoost = function(options) {
	this.setPosition(this.body.GetPosition());

	this.animateWheels();

	this.updateTurret(options);

	if(this.isOverdrive) {
		this.tickDownOverdrive();
	}
};

PlayerTank.prototype.exitBoost = function(options) {
	this.isBoosting = false;
	this.damage = 0;

	this.transformBodySensor(false);

	this.baseContainer.scaleX = 1;
	this.baseContainer.scaleY = 1;
	this.baseContainer.alpha = 1;
};

/**
*@public
*/
PlayerTank.prototype.enterRecharge = function(options) {
	this.isRecharging = true;

	app.assetsProxy.playSound("weaponchange2");
}

/**
*@public
*/
PlayerTank.prototype.updateRecharge = function(options) {
	//zero out body's linear velocity
	this.body.SetLinearVelocity(app.vecZero);

	this.checkMovement();

	//Updates the base rotation with a smooth transition
	this.updateRotation();

	this.animateWheels();

	this.setPosition(this.body.GetPosition());

	this.checkTurretTransition();

	this.updateTurret(options);

	this.updateEnergy();
};

/**
*@public
*/
PlayerTank.prototype.exitRecharge = function(options) {
	this.isRecharging = false;
};

/**
*@public
*/
PlayerTank.prototype.enterDeath = function(options) {
	var self = this,
		diversionPosition = new app.b2Vec2(this.position.x, this.position.y);

	setTimeout(function() {
		//ensure enemies are diverted to a new player position / target point with a minimum distance from the point of death
		while(self.position.DistanceSqrd(diversionPosition) < 4000) {
			self.position.x = app.arenaWidth * (Math.randomInRange(1, 9) * 0.1);
			self.position.y = app.arenaHeight * (Math.randomInRange(1, 9) * 0.1);
		}

		goog.events.dispatchEvent(self, self.gameOverEvent);
	}, 3000);

	createjs.Tween
		.get(this.container)
		.to({
				alpha: 0
			}, 
			1500);
};

/**
*@public
*/
PlayerTank.prototype.updateDeath = function(options) {};

/**
*@public
*/
PlayerTank.prototype.exitDeath = function(options) {
	this.setIsAlive(true);
};

/**
*@public
*/
PlayerTank.prototype.forceBoostExit = function() {
	this.isBoosting = false;

	this.isMoving = false;

	this.setStateMachine(PlayerDefaultState.KEY);
};

/**
*@public
*/
PlayerTank.prototype.checkMovement = function(options) {
	var input = app.input,
		worldCenter = this.body.GetWorldCenter(),
		isUp = false,
		isDown = false;

	this.isMoving = false;

	//check vertical movement
	if(input.isUpOmitDpad()) {

		this.force.x = 0;
		this.force.y = -this.velocity.y;
		this.body.ApplyForce(this.force, worldCenter);

		this.intendedRotation = 0;

		this.isMoving = isUp = true;
	} else if (input.isDownOmitDpad()) {
		this.force.x = 0;
		this.force.y = this.velocity.y;
		this.body.ApplyForce(this.force, worldCenter);

		this.intendedRotation = 180;

		this.isMoving = isDown = true;
	}

	//check horizontal movement
	if(input.isLeftOmitDpad()) {

		this.force.x = -this.velocity.x;
		this.force.y = 0;
		this.body.ApplyForce(this.force, worldCenter);

		if (isUp)		{ this.intendedRotation = 315; }
		else if(isDown)	{ this.intendedRotation = 225; } 
		else 			this.intendedRotation = 270;

		this.isMoving = true;
	} else if (input.isRightOmitDpad()) {

		this.force.x = this.velocity.x;
		this.force.y = 0;
		this.body.ApplyForce(this.force, worldCenter);

		if (isUp)		{ this.intendedRotation = 45; }
		else if(isDown)	{ this.intendedRotation = 135; } 
		else 			this.intendedRotation = 90;

		this.isMoving = true;
	}
};

/**
*@public
*/
PlayerTank.prototype.checkTurretTransition = function(options) {
	//WEAPON SELECT
	if(!this.isTransitioning) {
		var input = app.input;

		if(input.isKeyPressedOnce(KeyCode.Z) || input.isButtonPressedOnce(input.config[InputConfig.BUTTONS.SWITCH])) {
			this.currentWeaponIndex++;

			if(this.currentWeaponIndex > (WeaponMap.length - 1)) {
				this.currentWeaponIndex = 0;
			}
			
		//Check D-PAD 
		} else if(input.isButtonDown(GamepadCode.BUTTONS.DPAD_UP)) {
			this.currentWeaponIndex = 0;
		} else if(input.isButtonDown(GamepadCode.BUTTONS.DPAD_RIGHT)) {
			this.currentWeaponIndex = 1;
		} else if(input.isButtonDown(GamepadCode.BUTTONS.DPAD_DOWN)) {
			this.currentWeaponIndex = 2;
		} else if(input.isButtonDown(GamepadCode.BUTTONS.DPAD_LEFT)) {
			this.currentWeaponIndex = 3;
		}

		if(this.prevWeaponIndex != this.currentWeaponIndex) {
			app.assetsProxy.playSound("weaponchange1", 0.5);

			this.setTurret(
				WeaponMap[this.currentWeaponIndex].turretType,
				WeaponMap[this.currentWeaponIndex].projectileType
			);

			//notify the HUD to represent current weapon selection
			//handled by the PlayPanel instance
			goog.events.dispatchEvent(this, this.weaponSelectEvent);

			this.prevWeaponIndex = this.currentWeaponIndex;
		}
	}
};

/**e
*@public
*/
PlayerTank.prototype.animateWheels = function(options) {
	//Animate wheels upon movement
	if(this.isMoving) {
		 this.base.play();

		//Animate wheels
		for(var i = 0; i < this.arrWheels.length; i++) {
			this.arrWheels[i].play();
		}
	} else {
		this.base.gotoAndStop(0);

		//Stop wheel animation
		for(var i = 0; i < this.arrWheels.length; i++) {
			this.arrWheels[i].gotoAndStop(0);
		}
	};
};

PlayerTank.prototype.updateHoming = function(options) {
	var input = app.input,
		hto = options.hto;

	//HOMING
	//hold to init homing target overlay
	if(this.energy > 0 && !this.isHoming &&
		(
			input.isButtonDown(input.config[InputConfig.BUTTONS.HOMING]) || 
			input.isKeyDown(KeyCode.C) ||
			input.isMouseButtonDown(MouseCode.BUTTONS.RIGHT)
		)
	) {
		this.isHoming = true;

		//reset the total homing value; it will increment on HTO increase
		this.totalHomingValue = 0;

		//initializes the homing target overlay
		goog.events.dispatchEvent(this, this.addHomingOverlayEvent);
	}

	//release to fire if hto is operational
	if(this.isHoming) {
		if(
			!input.isButtonDown(input.config[InputConfig.BUTTONS.HOMING]) && 
			!input.isKeyDown(KeyCode.C) &&
			!input.isMouseButtonDown(MouseCode.BUTTONS.RIGHT)
		) {
			this.isHoming = false;

			//hto is operational so firing may commence
			if(hto.getCurrentState() === HomingTargetingOverlayOperationState.KEY) {
				this.fireHoming();
			}

			if(this.energy === 0) {
				this.reload();
			}

			//starts removal of homing overlay
			goog.events.dispatchEvent(this, this.removeHomingOverlayEvent);
		} else {
			if(this.energy > 0 && this.totalHomingValue <= PlayerTank.MAX_ENERGY) {
				this.homingInc = this.energy - 1;

				if(this.isOverdrive) {
					this.increaseHomingOverlayEvent.payload = PlayerTank.HOMING_INCREMENT * 2;
				} else {
					this.increaseHomingOverlayEvent.payload = PlayerTank.HOMING_INCREMENT;
				}

				this.changeEnergy(this.homingInc);

				//cache the total homing value based on payload; 
				//determines the total qty of homing missles fired
				this.totalHomingValue += this.increaseHomingOverlayEvent.payload;

				//gradually increases the size of the HTO while the homing button is pressed down
				goog.events.dispatchEvent(this, this.increaseHomingOverlayEvent);
			}
		}
	}
};

/**
*@public
*/
PlayerTank.prototype.updateTurret = function(options) {
	//if not transitioning or recharging the turret can fire
	var firingIsReady = !(this.isTransitioning | this.isRecharging);

	this.turret.update({ 
		energy: 		this.energy,
		firingIsReady: 	firingIsReady,
		camera: 		options.camera 
	});

	this.turretTransition.rotation = this.turret.shape.rotation;
	this.turretTransitionAddAnimUtil.update();
	this.turretTransitionRemoveAnimUtil.update();
};

PlayerTank.prototype.updateHealthTimer =  function() {
	if(this.isHealthModified) {
		this.healthModificationTimer++;

		if(this.healthModificationTimer > PlayerTank.HEALTH_MODIFICATION_LIMIT) {
			this.isHealthModified = false;
			this.healthModificationTimer = 0;
		}
	}
};

PlayerTank.prototype.checkBoost = function() {
	var input = app.input;

	if(this.energy >= PlayerTank.REQUIRED_FOR_BOOST && 
		(
			input.isButtonPressedOnce(input.config[InputConfig.BUTTONS.BOOST]) || 
			input.isKeyPressedOnce(KeyCode.SPACE)
		)
	) {
		this.stateMachine.setState(PlayerBoostState.KEY);

		app.assetsProxy.playSound("swoosh1");
	}
};

PlayerTank.prototype.checkReload = function() {
	var input = app.input;

	if(!this.isHoming && 
		(
			input.isButtonPressedOnce(input.config[InputConfig.BUTTONS.RELOAD]) ||
			input.isMouseButtonDown(MouseCode.BUTTONS.MIDDLE) ||
			input.isKeyPressedOnce(KeyCode.X)
		)
	) {
		this.reload();
	}
};

/**
*@public
*/
PlayerTank.prototype.reload = function() {
	this.changeEnergy(0);
};

/**
*@override
*@public
*/
PlayerTank.prototype.clear = function() {
	var i = 0;

	GameObject.prototype.clear.call(this);

	this.arrProjectileSystems = null;

	this.boostSystem = null;
	this.parrySystem = null;
	
	this.currentProjectileSystem = null;

	this.homingProjectileSystem = null;
	
	this.physicalPosition = null;

	this.body.SetAwake(false);
	this.body.SetUserData(null);
	this.body.DestroyFixture(this.body.GetFixtureList());
	app.physicsWorld.DestroyBody(this.body);
	this.body = null;

	this.turretBody.SetAwake(false);
	this.turretBody.SetUserData(null);
	this.turretBody.DestroyFixture(this.turretBody.GetFixtureList());
	app.physicsWorld.DestroyBody(this.turretBody);
	this.turretBody = null;

	this.container.removeAllChildren();
	this.container = null;

	this.base = null;

	this.baseContainer.removeAllChildren();
	this.baseContainer = null;

	for(i = 0; i < this.arrWheels.length; i++) {
		this.arrWheels[i] = null;
	}
	this.arrWheels = null;

	this.turretTransition = null;

	this.turretTransitionAddAnimUtil.clear();
	this.turretTransitionAddAnimUtil = null;

	this.turretTransitionRemoveAnimUtil.clear();
	this.turretTransitionRemoveAnimUtil = null;

	for(i = 0; i < this.arrTurrets.length; i++) {
		this.arrTurrets[i].clear();
		this.arrTurrets[i] = null;
	}
	this.arrTurrets = null;

	this.turret = null;

	this.hudOffset = null;

	this.stateMachine.clear();
	this.stateMachine = null;

	this.weaponSelectEvent 			= null;
	this.addHomingOverlayEvent 		= null;
	this.removeHomingOverlayEvent 	= null;
	this.increaseHomingOverlayEvent = null;
	this.energyChangeEvent 			= null;
	this.overdriveChangeEvent 		= null;
	this.gameOverEvent				= null;
};

/**
*@public
*/
PlayerTank.prototype.kill = function() {
	this.setIsAlive(false);
};

PlayerTank.prototype.updateEnergy = function() {
	if(!this.isHoming && this.energy < PlayerTank.MAX_ENERGY) {
		this.energy++;

		this.changeEnergy(this.energy);
	}
};

/**
*@private
*/
PlayerTank.prototype.updateRotation = function() {
	var angleDif = this.intendedRotation - this.baseContainer.rotation,
		absAngleDif = 0;

	if(angleDif != 0) {
		absAngleDif = Math.abs(angleDif);

		this.isMoving = true;

		if(absAngleDif >= 180) {
			if(this.intendedRotation > this.baseContainer.rotation) {
				RotationUtils.rotateToAngle(this.baseContainer, -this.rotationRate);
				this.turnWheels(-45);
			}
			else if(this.intendedRotation < this.baseContainer.rotation) {
				RotationUtils.rotateToAngle(this.baseContainer, this.rotationRate);
				this.turnWheels(45);
			}
		} else {
			if(this.intendedRotation > this.baseContainer.rotation) {
				RotationUtils.rotateToAngle(this.baseContainer, this.rotationRate);
				this.turnWheels(45);
			}
			else if(this.intendedRotation < this.baseContainer.rotation) {
				RotationUtils.rotateToAngle(this.baseContainer, -this.rotationRate);
				this.turnWheels(-45);
			}
		}
	} else {
		this.turnWheels(0);
	}
};

PlayerTank.prototype.turnWheels = function(deg) {
	var i = -1,
		length = this.arrWheels.length;

	while(++i < length) {
		this.arrWheels[i].rotation = deg;
	}
};

PlayerTank.prototype.setPosition = function(pos) {
	var scale = app.physicsScale,
		maxBoundsX = app.arenaWidth / scale,
		maxBoundsY = app.arenaHeight / scale;

	this.physicalPosition = pos;

	//check bounds and reset position to opposite side
	if(this.physicalPosition.x < 0) {
		this.physicalPosition.x = maxBoundsX;
	} else if(this.physicalPosition.x > maxBoundsX) {
		this.physicalPosition.x = 0;
	}

	if(this.physicalPosition.y < 0) {
		this.physicalPosition.y = maxBoundsY;
	} else if(this.physicalPosition.y > maxBoundsY) {
		this.physicalPosition.y = 0;
	}

	this.container.x = (this.physicalPosition.x * scale) - this.turret.shape.x;
	this.container.y = (this.physicalPosition.y * scale) - this.turret.shape.y;

	this.position.x = this.container.x + this.turret.shape.x;
	this.position.y = this.container.y + this.turret.shape.y;

	//SET TANK AND TURRET BODY POSITIONS
	this.body.SetPositionAndAngle(this.physicalPosition, Math.degToRad(this.baseContainer.rotation));
	this.turretBody.SetPosition(this.physicalPosition);
};

/**
*@public
*/
PlayerTank.prototype.setIsAlive = function(value) {
	this.body.SetAwake(value);
	this.body.SetActive(value);

	this.turretBody.SetAwake(value);
	this.turretBody.SetActive(value);

	this.isAlive = value;
};

/**
*@override
*@public
*/
PlayerTank.prototype.fireHoming = function() {
	var deg,
		sin,
		cos,
		scale = app.physicsScale,
		trigTable = app.trigTable,
		stage = this.container.getStage(),
		projectile = null,
		hpsLength = this.homingProjectileSystem.length(),
		i = -1;

	while(++i < hpsLength) {

		projectile = this.homingProjectileSystem.getProjectile();

		if(projectile) {		
			//acquire rotation of Turret instance in degrees and add ammo at table-referenced distance			
			deg = (this.baseContainer.rotation - 90 + PlayerTank.HOMING_OFFSETS[i]);
			sin = trigTable.sin(deg);
			cos = trigTable.cos(deg);
			
			projectile.position.x = this.container.x + this.baseContainer.x;
			projectile.position.y = this.container.y + this.baseContainer.y;

			projectile.physicalPosition.x = projectile.position.x / scale;
			projectile.physicalPosition.y = projectile.position.y / scale;
			projectile.body.SetPosition(projectile.physicalPosition);

			projectile.velocity.x = cos * projectile.velocityMod;
			projectile.velocity.y = sin * projectile.velocityMod;

			projectile.setIsAlive(true);
			
			stage.addChild(projectile.shape);
		}
	}

	if(projectile) {
		app.assetsProxy.playSound("laser_large");
	}
};

PlayerTank.prototype.setTurretMap = function() {
	this.arrTurrets[TurretTypes.VULCAN] = new VulcanTurret(
		false, 
		this.arrProjectileSystems[WeaponMap[0].projectileType]
	);

	this.arrTurrets[TurretTypes.SPREAD] = new SpreadTurret(
		false, 
		this.arrProjectileSystems[WeaponMap[1].projectileType]
	);

	this.arrTurrets[TurretTypes.BLADE] = new BladeTurret(
		false, 
		this.arrProjectileSystems[WeaponMap[2].projectileType]
	);

	this.arrTurrets[TurretTypes.SNIPER] = new SniperTurret(
		false, 
		this.arrProjectileSystems[WeaponMap[3].projectileType]
	);

	//set a default scaleY of each Turret.shape instance to 0
	for(var key in this.arrTurrets) {
		this.arrTurrets[key].shape.scaleY = 0;
	}
};

PlayerTank.prototype.setTurret = function(turretType, projectileType) {
	var prevTurret = this.turret;

	this.isTransitioning = true;

	if(this.currentProjectileSystem) {
		this.currentProjectileSystem.kill();
	}

	if(prevTurret) {
		this.changeTurret(turretType, prevTurret);
	} else { 
		this.addTurret(turretType);
	}
};

PlayerTank.prototype.changeTurret = function(turretType, prevTurret) {
	var self = this;

	this.container.addChild(this.turretTransition);
	this.turretTransitionAddAnimUtil.play();

	createjs.Tween.get(prevTurret.shape).to({ scaleY: 0 }, this.turretTransitionRate).call(function(){
		self.removeTurret(prevTurret);
		self.addTurret(turretType, prevTurret);
	});
};

PlayerTank.prototype.addTurret = function(turretType, prevTurret) {
	var self = this,
		transitionIndex = this.container.getChildIndex(this.turretTransition);

	this.turret = this.arrTurrets[turretType];

	if(prevTurret) {
		//only listen to one turret at a time so remove previous listener
		goog.events.unlisten(
			this.turret, 
			EventNames.ENERGY_CHANGE, 
			this.onEnergyChange, 
			false, 
			this
		);

		goog.events.unlisten(
			this.turret, 
			EventNames.ACTIVATE_PARRY, 
			this.onActivateParry, 
			false, 
			this
		);

		this.turret.shape.rotation = prevTurret.shape.rotation;
	}

	//listen to the current turret's energy change event each time it fires
	goog.events.listen(
		this.turret, 
		EventNames.ENERGY_CHANGE, 
		this.onEnergyChange, 
		false, 
		this
	);

	//listen to the current turret's energy change event each time it fires
	goog.events.listen(
		this.turret, 
		EventNames.ACTIVATE_PARRY, 
		this.onActivateParry, 
		false, 
		this
	);

	this.turret.shape.x = this.width * 0.5;
	this.turret.shape.y = this.height * 0.75;
	//this.turret.shape.scaleX = 0;

	this.turret.fireCount = this.turret.fireThreshold;
	this.currentProjectileSystem = this.turret.currentProjectileSystem;

	if(transitionIndex > -1) {
		this.container.addChildAt(
			this.turret.shape, 
			transitionIndex
		);
	} else {
		this.container.addChild(this.turret.shape);
	}

	//add additional Sniper Turret FX
	//TODO: need turret add/remove wrappers
	if(this.turret instanceof SniperTurret) {
		this.container.parent.addChild(this.turret.laserSight);
		this.container.parent.addChild(this.turret.ballEffects);
	}

	this.turretTransitionAddAnimUtil.stop();
	this.turretTransitionRemoveAnimUtil.play();

	createjs.Tween.get(this.turret.shape).to({ scaleY: 1 }, this.turretTransitionRate).call(function() {
		self.turretTransitionRemoveAnimUtil.stop();
		self.container.removeChild(self.turretTransition);

		self.isTransitioning = false;
	});
};

PlayerTank.prototype.removeTurret = function(prevTurret) {
	if(this.container.getChildIndex(prevTurret.shape) > -1) {
		this.container.removeChild(prevTurret.shape);
	}

	//remove additional Sniper Turret FX 
	//TODO: need turret add/remove wrappers
	if(prevTurret instanceof SniperTurret) {
		this.container.parent.removeChild(prevTurret.ballEffects);
		this.container.parent.removeChild(prevTurret.laserSight);
	}
};

PlayerTank.prototype.getTurret = function() {
	return this.turret;
};

PlayerTank.prototype.getIsOverdrive = function() {
	return this.isOverdrive;
};

/**
*@public
*/
PlayerTank.prototype.transformBodySensor = function(value) {
	var fixDef = new app.b2FixtureDef(),
		oldFixDef = this.body.GetFixtureList(),
		scale = app.physicsScale * 2,
		center = new app.b2Vec2();

	fixDef.density = 1;
	fixDef.friction = (value) ? 100 : 0;
	fixDef.restitution = 0;
	fixDef.filter.categoryBits = CollisionCategories.PLAYER_BASE;

	if(value) {
		fixDef.filter.maskBits = CollisionCategories.GROUND_ENEMY | CollisionCategories.ITEM;
	} else {
		fixDef.filter.maskBits = CollisionCategories.SCENE_OBJECT | CollisionCategories.GROUND_ENEMY | CollisionCategories.ITEM;
	}

	fixDef.isSensor = value;
	fixDef.shape = new app.b2PolygonShape();
	fixDef.shape.SetAsOrientedBox(this.width / scale, this.height / scale, center);

	if(oldFixDef) {
		this.body.DestroyFixture(oldFixDef);
	}
	
	this.body.CreateFixture(fixDef);
};

PlayerTank.prototype.setPhysics = function() {
	this.setTurretBody();
	this.setBaseBody();
};

PlayerTank.prototype.setBaseBody = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef(),
		scale = app.physicsScale * 2,
		center = new app.b2Vec2(
			0,
			0
		);
	
	fixDef.density = 1;
	fixDef.friction = 100;
	fixDef.restitution = 0;
	fixDef.filter.categoryBits = CollisionCategories.PLAYER_BASE;
	fixDef.filter.maskBits = CollisionCategories.SCENE_OBJECT | CollisionCategories.GROUND_ENEMY | CollisionCategories.ITEM;
	fixDef.shape = new app.b2PolygonShape();
	fixDef.shape.SetAsOrientedBox(this.width / scale, this.height / scale, center);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetAwake(true);
	this.body.SetActive(true);
};

PlayerTank.prototype.setTurretBody = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef();
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = CollisionCategories.PLAYER;
	fixDef.filter.maskBits = CollisionCategories.GROUND_ENEMY_PROJECTILE | 
		CollisionCategories.AIR_ENEMY_PROJECTILE;
	fixDef.isSensor = true;
	fixDef.shape = new app.b2CircleShape(1);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.turretBody = app.physicsWorld.CreateBody(bodyDef);
	this.turretBody.CreateFixture(fixDef);
	this.turretBody.SetUserData(this);
	this.turretBody.SetAwake(true);
	this.turretBody.SetActive(true);
};

PlayerTank.prototype.setStateMachine = function() {
	this.stateMachine = new StateMachine();

	this.stateMachine.addState(
		PlayerDefaultState.KEY,
		new PlayerDefaultState(this),
		[ PlayerBoostState.KEY, PlayerRechargeState.KEY, PlayerOverdriveState.KEY, PlayerDeathState.KEY ]
	);

	this.stateMachine.addState(
		PlayerBoostState.KEY,
		new PlayerBoostState(this),
		[ PlayerDefaultState.KEY, PlayerRechargeState.KEY, PlayerOverdriveState.KEY ]
	);

	this.stateMachine.addState(
		PlayerRechargeState.KEY,
		new PlayerRechargeState(this),
		[ PlayerDefaultState.KEY, PlayerOverdriveState.KEY, PlayerDeathState.KEY ]
	);

	this.stateMachine.addState(
		PlayerOverdriveState.KEY,
		new PlayerOverdriveState(this),
		[ PlayerDefaultState.KEY, PlayerBoostState.KEY, PlayerDeathState.KEY ]
	);

	this.stateMachine.addState(
		PlayerDeathState.KEY,
		new PlayerDeathState(this),
		[ PlayerDefaultState.KEY ]
	);
	
	this.stateMachine.setState(PlayerDefaultState.KEY);
};

PlayerTank.prototype.changeEnergy = function(value) {
	if(!this.isOverdrive) {
		if(value < 0) {
			value = 0;
		} else if(value > PlayerTank.MAX_ENERGY) {
			value = PlayerTank.MAX_ENERGY;
		}

		this.energyChangeEvent.payload = this.energy = value;
		goog.events.dispatchEvent(this, this.energyChangeEvent);

		if(!this.isHoming && !this.isBoosting) {
			if(this.energy < Math.abs(this.turret.energyConsumption)) {
				this.stateMachine.setState(PlayerRechargeState.KEY);
			} else if(this.energy === PlayerTank.MAX_ENERGY) {
				this.stateMachine.setState(PlayerDefaultState.KEY);
			}
		}
	}
};

PlayerTank.prototype.changeOverdrive = function(value) {
	if(!this.isOverdrive) {
		//cap this.overdrive value when necessary
		if(value < 0) {
			value = 0;
		} else if(value > PlayerTank.MAX_OVERDRIVE) {
			value = PlayerTank.MAX_OVERDRIVE;
		}

		//notify UI or other observers of overdrive change
		this.overdriveChangeEvent.payload = this.overdrive = value;
		goog.events.dispatchEvent(this, this.overdriveChangeEvent);

		//activate the overdrive state when enough is acquired		
		if(this.overdrive === PlayerTank.MAX_OVERDRIVE) {
			app.assetsProxy.playSound('powerup1');

			//max energy going into overdrive
			this.energyChangeEvent.payload = this.energy = PlayerTank.MAX_ENERGY;
			goog.events.dispatchEvent(this, this.energyChangeEvent);

			this.stateMachine.setState(PlayerOverdriveState.KEY);
		}
	}
};

PlayerTank.prototype.enterOverdrive = function(options) {

	if(this.overdrive === PlayerTank.MAX_OVERDRIVE) {
		//set all turrets to overdrive firing
		for(var key in this.arrTurrets) {
			this.arrTurrets[key].setFiringState(Turret.FIRE_TYPES.ALT);
		}

		//remove old projectiles and update PlayerTank proj system reference to most recent proj system
		this.currentProjectileSystem.kill();
		this.currentProjectileSystem = this.turret.currentProjectileSystem;

		this.overdriveTimer = PlayerOverdriveState.DURATION;

		this.isOverdrive = true;
	}
};

PlayerTank.prototype.updateOverdrive = function(options) {
	this.updateDefault(options);

	this.tickDownOverdrive();
};

PlayerTank.prototype.exitOverdrive = function(options) {

	if(this.overdrive === 0) {
		//set all turrets to default firing
		for(var key in this.arrTurrets) {
			this.arrTurrets[key].setFiringState(Turret.FIRE_TYPES.DEFAULT);
		}

		//remove old projectiles and update PlayerTank proj system reference to most recent proj system
		this.currentProjectileSystem.kill();
		this.currentProjectileSystem = this.turret.currentProjectileSystem;

		//reset overdrive to zero
		this.changeOverdrive(0);

		//cease overdrive status
		this.isOverdrive = false;
	}
};

PlayerTank.prototype.tickDownOverdrive = function() {
	this.overdriveTimer--;

	this.overdriveChangeEvent.payload = this.overdrive = 100 * (this.overdriveTimer / PlayerOverdriveState.DURATION);
	goog.events.dispatchEvent(this, this.overdriveChangeEvent);

	if(this.overdriveTimer === 0) {
		this.stateMachine.setState(PlayerDefaultState.KEY);
	}
};

PlayerTank.prototype.getHealth = function() {
	return this.health;
};

PlayerTank.prototype.getIsHealthModified = function() {
	return this.isHealthModified;
};

/**
*@public
*/
PlayerTank.prototype.modifyHealth = function(value) {
	this.health += value;

	this.isHealthModified = true;
	this.healthModificationTimer = 0;

	if(this.health < 0) {
		this.health = 0;
	} else if(this.health > PlayerTank.MAX_HEALTH) {
		this.health = PlayerTank.MAX_HEALTH;
	}

	this.modifyHealthEvent.payload = {
		health: this.health, 
		inc: value
	};
	
	goog.events.dispatchEvent(this, this.modifyHealthEvent);

	return this.health;
};

PlayerTank.prototype.onEnergyChange = function(e) {
	if(!this.isOverdrive) {
		this.energy += e.payload;

		this.changeEnergy(this.energy);
	}
};

PlayerTank.prototype.onOverdriveChange = function(e) {
	if(!this.isOverdrive) {
		this.overdrive += e.payload;

		this.changeOverdrive(this.overdrive);
	}
};

PlayerTank.prototype.onActivateParry = function(e) {
	if(!this.parrySystem.getParticleByIndex(0).isAlive) {
		this.changeEnergy(0);

		this.parrySystem.emit(1, { target: this });
	}
};

/**
*@public
*/
PlayerTank.prototype.onCollide = function(collisionObject, options) {
	var damage = -collisionObject.damage || -1;

	if(this.modifyHealth(damage) === 0) {
		var self = this;

		//delay to coincide with sound fx
		setTimeout(function() {
			options.explosions.emit(32, {
				posX: self.position.x,
				posY: self.position.y,
				posOffsetX: 16,
				posOffsetY: 16,
				velX: 8,
				velY: 8
			});
		}, 1000);

		this.stateMachine.setState(PlayerDeathState.KEY);
	}
};

goog.exportSymbol('PlayerTank', PlayerTank);