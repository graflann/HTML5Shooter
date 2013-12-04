goog.provide('SniperTurret');

goog.require('Turret');
goog.require('AnimationUtility');

/**
*@constructor
*Sniper turret with alt laser fire
*/
SniperTurret = function(hasAI, arrProjectileSystems) {	
	Turret.call(this, hasAI, arrProjectileSystems);

	this.stateMachine = null;

	this.turretEnterFireAnimUtil = null;

	this.laserSight = null;

	this.ballEffects = null;

	this.ballEffectsDistance = 56;
	
	this.init();
};

goog.inherits(SniperTurret, Turret);

/**
*@override
*@public
*/
SniperTurret.prototype.init = function() {
	var self = this;

	this.fireThreshold = 30;
	this.fireCounter = this.fireThreshold - 1;

	this.energyConsumption = -40;

	this.ammoDistance = 96 / app.physicsScale;

	this.shape = new createjs.BitmapAnimation(app.assetsProxy.arrSpriteSheet["railTurret"]);
	this.shape.regX = 16;
	this.shape.regY = 73;
	this.shape.gotoAndStop("railTurret");

	this.turretEnterFireAnimUtil = new AnimationUtility("railTurretEnterFire", this.shape, 3);

	this.ballEffects = new createjs.Shape();
	this.ballEffects.alpha = 0.5;

	this.laserSight = new createjs.Shape();
	this.laserSight.snapToPixel = true;
	this.laserSight.graphics 
		.ss(4, "round")
		.ls([Constants.BLUE, Constants.DARK_BLUE], [1, 0.03125], 0, 0, 0, -Constants.HEIGHT * 0.75)
		.mt(0, 0)
		.lt(0, -Constants.HEIGHT);
	this.laserSight.alpha = 0.5;

	this.laserSight.cache(-2, -Constants.HEIGHT, 2, Constants.HEIGHT);

	this.setStateMachine();
	this.setFiringState(Turret.FIRE_TYPES.ALT);

	Turret.prototype.init.call(this);
};

/**
*@override
*@public				
*/
SniperTurret.prototype.update = function(options) {	
	Turret.prototype.update.call(this, options);

	this.stateMachine.update(options);
};

SniperTurret.prototype.clear = function() {
	this.shape.removeAllEventListeners();

	Turret.prototype.clear.call(this);
};

/**
*@override
*@public				
*/
SniperTurret.prototype.enterDefaultFire = function(options) {
	Turret.prototype.enterDefaultFire.call(this, options);

	this.fireThreshold = 30;
	this.fireCounter = this.fireThreshold - 1;

	this.energyConsumption = -40;
};

/**
*@override
*@public				
*/
SniperTurret.prototype.enterAltFire = function(options) {
	Turret.prototype.enterAltFire.call(this, options);

	this.fireThreshold = 2;
	this.fireCounter = this.fireThreshold - 1;

	this.energyConsumption = -5;
};

/**
*@public				
*/
SniperTurret.prototype.updateDefaultFire = function(options) {	
	this.turretEnterFireAnimUtil.update();

	
};

/**
*@public				
*/
SniperTurret.prototype.updateAltFire = function(options) {
	if(this.isFiring) {
		//this.turretExitFireAnimUtil.stop();

		if(this.turretEnterFireAnimUtil.currentFrame !== this.turretEnterFireAnimUtil.maxFrame) {
		 	this.turretEnterFireAnimUtil.play();
		} else {
			this.turretEnterFireAnimUtil.stop(this.turretEnterFireAnimUtil.maxFrame);
		}

		this.laserSight.alpha = 0;

		this.turretEnterFireAnimUtil.update();
		this.updateAltEffects();
	} else if(!this.isFiring){
		this.turretEnterFireAnimUtil.stop();
		this.updateEffects();

		this.laserSight.alpha = 0.5;
	}
};

SniperTurret.prototype.defaultFire = function() {
	var deg,
		sin,
		cos,
		vector2D,
		stage = this.shape.getStage(),
		projectile = this.currentProjectileSystem.getProjectile(),
		x = this.shape.x,
		y = this.shape.y,
		self = this;

	if(projectile) {
		vector2D = new app.b2Vec2();
		
		//zero out existing linear velocity
		projectile.body.SetLinearVelocity(vector2D);
		
		//acquire rotation of Turret instance in degrees and add ammo at table-referenced distance			
		deg = this.shape.rotation - 90;
		sin = app.trigTable.sin(deg);
		cos = app.trigTable.cos(deg);

		globalPt = this.shape.localToGlobal(0, 0);
		
		vector2D.x = ((this.shape.parent.x + this.shape.x) / app.physicsScale) + (cos * this.ammoDistance);
		vector2D.y = ((this.shape.parent.y + this.shape.y) / app.physicsScale) + (sin * this.ammoDistance);				
		projectile.body.SetPosition(vector2D);

		projectile.setIsAlive(true);
		projectile.shape.rotation = this.shape.rotation;
		
		vector2D.x = cos * projectile.velocityMod;
		vector2D.y = sin * projectile.velocityMod;				
		projectile.body.ApplyForce(vector2D, projectile.body.GetWorldCenter());
		
		stage.addChild(projectile.shape);

		this.turretEnterFireAnimUtil.play();

		//fade the ball & laser sight in upon shooting then back in
		createjs.Tween.get(this.ballEffects).to({alpha: 0, scaleX: 0, scaleY: 0}, 250).call(function(){
			createjs.Tween.get(self.ballEffects).to({alpha: 0.5, scaleX: 1, scaleY: 1}, 300);
		});

		createjs.Tween.get(this.laserSight).to({alpha: 0, scaleX: 0, scaleY: 0}, 250).call(function(){
			createjs.Tween.get(self.laserSight).to({alpha: 0.5, scaleX: 1, scaleY: 1}, 300);
		});
	}
};

SniperTurret.prototype.altFire = function() {
	var deg,
		sin,
		cos,
		vector2D,
		stage = this.shape.getStage(),
		projectile = this.currentProjectileSystem.getProjectile(),
		x = this.shape.x,
		y = this.shape.y,
		self = this;

	if(projectile) {
		vector2D = new app.b2Vec2();
		
		//zero out existing linear velocity
		projectile.body.SetLinearVelocity(vector2D);
		
		//acquire rotation of Turret instance in degrees and add ammo at table-referenced distance			
		deg = this.shape.rotation - 90;
		sin = app.trigTable.sin(deg);
		cos = app.trigTable.cos(deg);

		globalPt = this.shape.localToGlobal(0, 0);
		
		vector2D.x = ((this.shape.parent.x + this.shape.x) / app.physicsScale) + (cos * this.ammoDistance);
		vector2D.y = ((this.shape.parent.y + this.shape.y) / app.physicsScale) + (sin * this.ammoDistance);				
		projectile.body.SetPosition(vector2D);

		projectile.setIsAlive(true);
		projectile.shape.rotation = this.shape.rotation;
		
		vector2D.x = cos * projectile.velocityMod;
		vector2D.y = sin * projectile.velocityMod;				
		projectile.body.ApplyForce(vector2D, projectile.body.GetWorldCenter());
		
		stage.addChild(projectile.shape);
	}
};

SniperTurret.prototype.updateEffects = function() {
	var deg = this.shape.rotation - 90,
		trigTable = app.trigTable,
		sin = trigTable.sin(deg),
		cos = trigTable.cos(deg),
		randRadius = Math.randomInRange(8, 12),
		randOrigin = Math.randomInRange(0, 4);

	//redraw ball for dynamic fx
	if(createjs.Ticker.getTicks() % 5 == 0) {
		this.ballEffects.graphics.clear();

		this.ballEffects.alpha = Math.randomInRange(0.25, 0.75);

		this.ballEffects.graphics
			.f(Constants.BLUE)
			.dc(0, 0, randRadius)
			.ss(Math.randomInRange(1, 2))
			.s(Constants.LIGHT_BLUE)
			.mt(randOrigin, randOrigin)
			.lt(0, randRadius)
			.mt(-randOrigin, -randOrigin)
			.lt(randRadius, 0)
			.mt(randOrigin, randOrigin)
			.lt(0, -randRadius)
			.mt(-randOrigin, -randOrigin)
			.lt(-randRadius, 0);
	}

	this.ballEffects.rotation += Math.randomInRange(-90, 90);

	this.laserSight.x = this.ballEffects.x = (this.shape.parent.x + this.shape.x) + 
							(cos * this.ballEffectsDistance);
	this.laserSight.y = this.ballEffects.y = (this.shape.parent.y + this.shape.y) + 
							(sin * this.ballEffectsDistance);

	this.laserSight.rotation = this.shape.rotation;
};

SniperTurret.prototype.updateAltEffects = function() {
	var deg = this.shape.rotation - 90,
		trigTable = app.trigTable,
		sin = trigTable.sin(deg),
		cos = trigTable.cos(deg),
		randRadius = Math.randomInRange(12, 16),
		randOrigin = Math.randomInRange(0, 4);

	//redraw ball for dynamic fx
	if(createjs.Ticker.getTicks() % 5 == 0) {
		this.ballEffects.graphics.clear();

		this.ballEffects.alpha = Math.randomInRange(0.25, 0.75);

		this.ballEffects.graphics
			.f(Constants.BLUE)
			.dc(0, 0, randRadius)
			.ss(Math.randomInRange(1, 2))
			.s(Constants.LIGHT_BLUE)
			.mt(randOrigin, randOrigin)
			.lt(0, randRadius)
			.mt(-randOrigin, -randOrigin)
			.lt(randRadius, 0)
			.mt(randOrigin, randOrigin)
			.lt(0, -randRadius)
			.mt(-randOrigin, -randOrigin)
			.lt(-randRadius, 0);
	}

	this.ballEffects.rotation += Math.randomInRange(-90, 90);

	this.ballEffects.x = (this.shape.parent.x + this.shape.x) + (cos * this.ballEffectsDistance);
	this.ballEffects.y = (this.shape.parent.y + this.shape.y) + (sin * this.ballEffectsDistance);
};