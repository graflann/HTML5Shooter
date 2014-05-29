goog.provide('VulcanTurret');

goog.require('Turret');
goog.require('AnimationUtility');

/**
*@constructor
*Vulcan turret with alt hunter fire
*/
VulcanTurret = function(hasAI, arrProjectileSystems) {	
	Turret.call(this, hasAI, arrProjectileSystems);

	this.stateMachine = null;

	this.defaultAnimUtil = null;
	this.altAnimUtil = null;

	this.fireOffset = 0.0625;
	
	this.init();
};

goog.inherits(VulcanTurret, Turret);

VulcanTurret.FIRE_OFFSETS = {
	ALT: [-10, 10]
};

/**
*@override
*@public
*/
VulcanTurret.prototype.init = function() {
	this.fireThreshold = 4;
	this.fireCounter = this.fireThreshold - 1;

	this.energyConsumption = -PlayerTank.MAX_ENERGY / 50;

	this.ammoDistance = 48 / app.physicsScale;

	this.shape = new createjs.BitmapAnimation(app.assetsProxy.arrSpriteSheet["vulcanTurret"]);
	this.shape.regX = 16;
	this.shape.regY = 44;
	this.shape.gotoAndStop("vulcanTurret");

	this.defaultAnimUtil = new AnimationUtility("vulcanTurret", this.shape, 2);
	this.defaultAnimUtil.loop(true);

	this.altAnimUtil = new AnimationUtility("dualVulcanTurret", this.shape, 2);
	this.altAnimUtil.loop(true);

	this.offsetLength = VulcanTurret.FIRE_OFFSETS.ALT.length;

	this.setStateMachine();
	this.setFiringState(Turret.FIRE_TYPES.DEFAULT);

	Turret.prototype.init.call(this);
};

/**
*@override
*@public				
*/
VulcanTurret.prototype.update = function(options) {	
	Turret.prototype.update.call(this, options);

	this.stateMachine.update(options);
};

VulcanTurret.prototype.clear = function() {
	Turret.prototype.clear.call(this);

	this.stateMachine.clear();
	this.stateMachine = null;

	this.defaultAnimUtil.clear();
	this.defaultAnimUtil = null;

	this.altAnimUtil.clear();
	this.altAnimUtil = null;
};

/**
*@override
*@public				
*/
VulcanTurret.prototype.enterDefaultFire = function(options) {
	Turret.prototype.enterDefaultFire.call(this, options);

	this.fireThreshold = 4;
	this.fireCounter = this.fireThreshold - 1;

	this.altAnimUtil.stop();

	//this.energyConsumption = -7;
};

/**
*@public				
*/
VulcanTurret.prototype.updateDefaultFire = function(options) {	
	(this.isFiring) ? this.defaultAnimUtil.play() : this.defaultAnimUtil.stop();
	this.defaultAnimUtil.update();
};

/**
*@override
*@public				
*/
VulcanTurret.prototype.enterAltFire = function(options) {
	Turret.prototype.enterAltFire.call(this, options);

	this.fireThreshold = 3;
	this.fireCounter = this.fireThreshold - 1;

	this.defaultAnimUtil.stop();
};

/**
*@public				
*/
VulcanTurret.prototype.updateAltFire = function(options) {	
	(this.isFiring) ? this.altAnimUtil.play() : this.altAnimUtil.stop(2);
	this.altAnimUtil.update();
};

VulcanTurret.prototype.defaultFire = function() {
	var deg,
		sin,
		cos,
		vector2D,
		stage = this.shape.getStage(),
		projectile = this.currentProjectileSystem.getProjectile(),
		offset = Math.randomInRange(-this.fireOffset, this.fireOffset);

	if(projectile) {
		vector2D = new app.b2Vec2();
		
		//zero out existing linear velocity
		projectile.body.SetLinearVelocity(vector2D);
		
		//acquire rotation of Turret instance in degrees and add ammo at table-referenced distance			
		deg = this.shape.rotation - 90;
		sin = app.trigTable.sin(deg);
		cos = app.trigTable.cos(deg);
		
		vector2D.x = ((this.shape.parent.x + this.shape.x) / app.physicsScale) + (cos * this.ammoDistance);
		vector2D.y = ((this.shape.parent.y + this.shape.y) / app.physicsScale) + (sin * this.ammoDistance);				
		projectile.body.SetPosition(vector2D);
		projectile.shape.rotation = this.shape.rotation;

		projectile.setIsAlive(true);

		vector2D.x = (cos + offset) * projectile.velocityMod;
		vector2D.y = (sin + offset) * projectile.velocityMod;				
		projectile.body.ApplyForce(vector2D, projectile.body.GetWorldCenter());
		
		stage.addChild(projectile.shape);

		app.assetsProxy.playSound("vulcan", 0.5);
	}
};

VulcanTurret.prototype.altFire = function() {
	var deg,
		sin,
		cos,
		firingPosDeg,
		firingPosSin,
		firingPosCos,
		vector2D,
		trigTable = app.trigTable,
		stage = this.shape.getStage(),
		projectile = null,
		offset = Math.randomInRange(-this.fireOffset, this.fireOffset),
		i = -1;

	while(++i < this.offsetLength) {
		projectile = this.currentProjectileSystem.getProjectile();

		if(projectile) {
			vector2D = new app.b2Vec2();
			
			//zero out existing linear velocity
			projectile.body.SetLinearVelocity(vector2D);
			
			//acquire rotation of Turret instance in degrees and add ammo at table-referenced distance			
			deg = this.shape.rotation - 90;
			sin = app.trigTable.sin(deg);
			cos = app.trigTable.cos(deg);

			//acquire values to determine firing position
			firingPosDeg = deg + VulcanTurret.FIRE_OFFSETS.ALT[i];
			firingPosSin = trigTable.sin(firingPosDeg);
			firingPosCos = trigTable.cos(firingPosDeg);
			
			vector2D.x = ((this.shape.parent.x + this.shape.x) / app.physicsScale) + (firingPosCos * this.ammoDistance);
			vector2D.y = ((this.shape.parent.y + this.shape.y) / app.physicsScale) + (firingPosSin * this.ammoDistance);				
			projectile.body.SetPosition(vector2D);
			projectile.shape.rotation = this.shape.rotation;

			projectile.setIsAlive(true);

			vector2D.x = (cos + offset) * projectile.velocityMod;
			vector2D.y = (sin + offset) * projectile.velocityMod;				
			projectile.body.ApplyForce(vector2D, projectile.body.GetWorldCenter());
			
			stage.addChild(projectile.shape);

			app.assetsProxy.playSound("vulcan", 0.5);
		}
	}
};