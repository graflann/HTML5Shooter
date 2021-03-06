goog.provide('EnemyVulcanTurret');

goog.require('Turret');
goog.require('AnimationUtility');

/**
*@constructor
*/
EnemyVulcanTurret = function(hasAI, arrProjectileSystems) {	
	Turret.call(this, hasAI, arrProjectileSystems);

	this.turretAnimUtil = null;
	
	this.init();
};

goog.inherits(EnemyVulcanTurret, Turret);

/**
*@override
*@public
*/
EnemyVulcanTurret.prototype.init = function() {
	this.fireThreshold = 4;
	this.fireCounter = this.fireThreshold - 1;

	this.ammoDistance = 48 / app.physicsScale;

	this.shape = new createjs.BitmapAnimation(app.assetsProxy.arrSpriteSheet["enemyVulcanTurret"]);
	this.shape.regX = 16;
	this.shape.regY = 44;
	this.shape.gotoAndStop(0);

	this.turretAnimUtil = new AnimationUtility("enemyVulcanTurret", this.shape, 3);

	Turret.prototype.init.call(this);

	this.firingState = Turret.FIRE_TYPES.DEFAULT;
	this.currentProjectileSystem = this.arrProjectileSystems[this.firingState];
	this.fire = this.defaultFire;
};

/**
*@override
*@public				
*/
EnemyVulcanTurret.prototype.update = function(options) {	
	if(this.hasAI) {
		this.aiControl(options);

		this.turretAnimUtil.update();
	} else {
		this.manualControl();

		this.turretAnimUtil.update();
	}
};

/**
*@override
*@public
*/
EnemyVulcanTurret.prototype.clear = function() {
	Turret.prototype.clear.call(this);

	this.turretAnimUtil.clear();
	this.turretAnimUtil = null;
};

EnemyVulcanTurret.prototype.defaultFire = function() {
	var deg,
		sin,
		cos,
		vector2D,
		stage = this.shape.getStage(),
		projectile = this.currentProjectileSystem.getProjectile();

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

		vector2D.x = cos * projectile.velocityMod;
		vector2D.y = sin * projectile.velocityMod;				
		projectile.body.ApplyForce(vector2D, projectile.body.GetWorldCenter());

		this.turretAnimUtil.play()
		
		stage.addChild(projectile.shape);
	}
};