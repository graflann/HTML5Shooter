goog.provide('PlayerTank');

goog.require('GameObject');
goog.require('Turret');
goog.require('TurretClasses');
goog.require('TurretTypes');
goog.require('KeyCode');
goog.require('GamepadCode');
goog.require('WeaponMap');
goog.require('EventNames');


/**
*@constructor
*/
PlayerTank = function(arrProjectileSystems) {
	GameObject.call(this);

	/**
	 * @type {Array}
	 */
	this.arrProjectileSystems = arrProjectileSystems;
		
	/**
	*@type  {String}
	*/
	this.color = Constants.BLUE;
	
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
	
	this.physicalPosition = null;

	this.body = null;
	this.turretBody = null;

	this.container = null;

	this.base = null;

	this.turret = null;

	this.arrTurrets = [];

	this.isHoming = false;

	this.arrHomingFireOffsets = [-150, 150, -120, 120];

	this.weaponSelectEvent 			= new goog.events.Event(EventNames.WEAPON_SELECT, this);
	this.addHomingOverlayEvent 		= new goog.events.Event(EventNames.ADD_HOMING_OVERLAY, this);
	this.removeHomingOverlayEvent 	= new goog.events.Event(EventNames.REMOVE_HOMING_OVERLAY, this);

	this.init();
};

goog.inherits(PlayerTank, GameObject);

PlayerTank.KEY = "player";

/**
*@override
*@public
*/
PlayerTank.prototype.init = function() {
	this.container = new createjs.Container();

	this.width = 48;
	this.height = 64;

	this.velocity.x = 4800;
	this.velocity.y = 4800;

	this.base = new createjs.BitmapAnimation(app.assetsProxy.arrSpriteSheet["tankBase"]);
	this.base.x = this.base.regX = this.width * 0.5;
	this.base.y = this.base.regY = this.height * 0.5;
	this.container.addChild(this.base);

	this.setTurret(TurretTypes.VULCAN, ProjectileTypes.VULCAN);

	this.homingProjectileSystem = this.arrProjectileSystems[ProjectileTypes.HOMING];

	this.base.gotoAndStop(0);

	this.position = new app.b2Vec2();
	this.physicalPosition = new app.b2Vec2();

	this.force = new app.b2Vec2();

	this.setPhysics();

	this.setIsAlive(true);
};

/**
*@override
*@public
*/
PlayerTank.prototype.update = function(options) {
	if(this.isAlive) {
		var input = app.input,
			gamepad = input.gamepad,
			isUp = false,
			isDown = false,
			isMoving = false,
			hto = options.hto,
			worldCenter = this.body.GetWorldCenter();

		//zero out any linear velocity
		this.body.SetLinearVelocity( app.vecZero);

		//MOVEMENT
		if(input.isKeyDown(KeyCode.W) || 
			(gamepad && input.isButtonDown(GamepadCode.BUTTONS.DPAD_UP))) {

			this.force.x = 0;
			this.force.y = -this.velocity.y;
			this.body.ApplyForce(this.force, worldCenter);

			this.base.rotation = 0;

			isMoving = isUp = true;
		} else if (input.isKeyDown(KeyCode.S) || 
			(gamepad && input.isButtonDown(GamepadCode.BUTTONS.DPAD_DOWN))) {

			this.force.x = 0;
			this.force.y = this.velocity.y;
			this.body.ApplyForce(this.force, worldCenter);

			this.base.rotation = 180;

			isMoving = isDown = true;
		}

		if(input.isKeyDown(KeyCode.A) || 
			(gamepad && input.isButtonDown(GamepadCode.BUTTONS.DPAD_LEFT))) {

			this.force.x = -this.velocity.x;
			this.force.y = 0;
			this.body.ApplyForce(this.force, worldCenter);

			if (isUp)		{ this.base.rotation = 315; }
			else if(isDown)	{ this.base.rotation = 225; } 
			else 			this.base.rotation = 270;

			isMoving = true;
		} else if (input.isKeyDown(KeyCode.D) || 
			(gamepad && input.isButtonDown(GamepadCode.BUTTONS.DPAD_RIGHT))) {

			this.force.x = this.velocity.x;
			this.force.y = 0;
			this.body.ApplyForce(this.force, worldCenter);

			if (isUp)		{ this.base.rotation = 45; }
			else if(isDown)	{ this.base.rotation = 135; } 
			else 			this.base.rotation = 90;

			isMoving = true;
		}
		
		//HOMING
		//hold to init homing target overlay
		if(input.isButtonDown(GamepadCode.BUTTONS.Y) && !this.isHoming) {
			this.isHoming = true;

			//initializes the homing target overlay
			goog.events.dispatchEvent(this, this.addHomingOverlayEvent);
		}

		//release to fire if hto is operational
		if(!input.isButtonDown(GamepadCode.BUTTONS.Y) && this.isHoming) {
			this.isHoming = false;

			//hto is operational so firing may commence
			if(hto.getCurrentState() === HomingTargetingOverlayOperationState.KEY) {
				this.fireHoming();
			}

			//starts removal of homing overlay
			goog.events.dispatchEvent(this, this.removeHomingOverlayEvent);
		}
		

		//WEAPON SELECT
		if(input.isKeyPressedOnce(KeyCode.X) || 
			input.isButtonPressedOnce(GamepadCode.BUTTONS.X)) {
				
			this.currentWeaponIndex++;

			if(this.currentWeaponIndex > (WeaponMap.length - 1)) {
				this.currentWeaponIndex = 0;
			}

			this.setTurret(
				WeaponMap[this.currentWeaponIndex].turretType,
				WeaponMap[this.currentWeaponIndex].projectileType
			);

			//notify the HUD to represent current weapon selection
			//handled by the PlayPanel instance
			goog.events.dispatchEvent(this, this.weaponSelectEvent);
		}

		(isMoving) ? this.base.play() : this.base.gotoAndStop(0);

		this.setPosition(this.body.GetPosition());

		this.turret.update();
	}

	app.input.checkPrevKeyDown([
		KeyCode.Z//,
		//KeyCode.X
	]);

	app.input.checkPrevButtonDown([
		GamepadCode.BUTTONS.LT,
		GamepadCode.BUTTONS.X//,
		//GamepadCode.BUTTONS.Y
	]);
};

/**
*@override
*@public
*/
PlayerTank.prototype.clear = function() {
	
};

PlayerTank.prototype.setPosition = function(pos) {
	var scale = app.physicsScale;

	this.physicalPosition = pos;

	this.container.x = (this.physicalPosition.x * scale) - this.turret.shape.x;
	this.container.y = (this.physicalPosition.y * scale) - this.turret.shape.y;

	this.position.x = this.container.x + this.turret.shape.x;
	this.position.y = this.container.y + this.turret.shape.y;

	//SET TANK AND TURRET BODY POSITIONS
	this.body.SetPositionAndAngle(pos, Math.degToRad(this.base.rotation));
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
		scale = app.physcialScale,
		trigTable = app.trigTable,
		stage = this.container.getStage(),
		projectile = null,
		hpsLength = this.homingProjectileSystem.length(),
		i = -1;

	while(++i < hpsLength) {

		projectile = this.homingProjectileSystem.getProjectile();

		if(projectile) {		
			//acquire rotation of Turret instance in degrees and add ammo at table-referenced distance			
			deg = (this.base.rotation - 90 + this.arrHomingFireOffsets[i]);
			sin = trigTable.sin(deg);
			cos = trigTable.cos(deg);
			
			projectile.position.x = this.container.x + this.base.x;
			projectile.position.y = this.container.y + this.base.y;

			projectile.physicalPosition.x = projectile.position.x / scale;
			projectile.physicalPosition.y = projectile.position.y / scale;
			projectile.body.SetPosition(projectile.physicalPosition);

			projectile.velocity.x = cos * projectile.velocityMod;
			projectile.velocity.y = sin * projectile.velocityMod;

			projectile.setIsAlive(true);
			
			stage.addChild(projectile.shape);
		}
	}
};

PlayerTank.prototype.setTurret = function(turretType, projectileType) {
	var prevTurret = this.turret;

	if(this.currentProjectileSystem) {
		this.currentProjectileSystem.kill();
	}

	this.currentTurretType = turretType;
	this.currentProjectileType = projectileType;
	this.currentProjectileSystem = this.arrProjectileSystems[projectileType];

	if(!this.arrTurrets[turretType]) {
		var TurretClass = TurretClasses[turretType];
		this.turret = this.arrTurrets[turretType] = new TurretClass(this.color, this.currentProjectileSystem, false);
	} else {
		this.turret = this.arrTurrets[turretType];
	}

	if(prevTurret) {
		if(this.container.getChildIndex(prevTurret.shape) > -1) {
			this.container.removeChild(prevTurret.shape);
		}

		if(prevTurret instanceof SniperTurret) {
			this.container.parent.removeChild(prevTurret.ballEffects);
		}

		this.turret.shape.rotation = prevTurret.shape.rotation;
	}

	this.turret.shape.x = this.width * 0.5;
	this.turret.shape.y = this.height * 0.5;

	this.turret.fireCount = (this.turret.fireThreshold - 1);

	this.container.addChild(this.turret.shape);

	if(this.turret instanceof SniperTurret) {
		this.container.parent.addChild(this.turret.ballEffects);
	}
};

PlayerTank.prototype.setPhysics = function() {
	this.setTurretBody();
	this.setBaseBody();
};

PlayerTank.prototype.setBaseBody = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef(),
		scale = app.physicsScale * 2;
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 0;
	fixDef.filter.categoryBits = CollisionCategories.PLAYER_BASE;
	fixDef.filter.maskBits = CollisionCategories.SCENE_OBJECT | CollisionCategories.GROUND_ENEMY;
	fixDef.shape = new app.b2PolygonShape();
	fixDef.shape.SetAsBox(this.width / scale, this.height / scale);
	
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

goog.exportSymbol('PlayerTank', PlayerTank);