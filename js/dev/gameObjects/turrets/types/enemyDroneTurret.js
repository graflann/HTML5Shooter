goog.provide('EnemyDroneTurret');

goog.require('Turret');
goog.require('AnimationUtility');

/**
*@constructor
*/
EnemyDroneTurret = function(hasAI, arrProjectileSystems) {	
	Turret.call(this, hasAI, arrProjectileSystems);

	this.turretAnimUtil = null;
	
	this.init();
};

goog.inherits(EnemyDroneTurret, Turret);

/**
* Quantity per firing instance
*/
EnemyDroneTurret.FIRE_OFFSETS = [-20, 20];

/**
*@override
*@public
*/
EnemyDroneTurret.prototype.init = function() {
	var droneTurretSpriteSheet = app.assetsProxy.arrSpriteSheet["enemyDroneTurret"];

	this.width = droneTurretSpriteSheet._frames[0].rect.width;
	this.height = droneTurretSpriteSheet._frames[0].rect.height;

	this.fireThreshold = 4;
	this.fireCounter = this.fireThreshold - 1;

	this.ammoDistance = 24 / app.physicsScale;

	this.shape = new createjs.BitmapAnimation(droneTurretSpriteSheet);
	this.shape.regX = this.width * 0.5;
	this.shape.regY = this.height * 0.5;
	this.shape.gotoAndStop(0);

	this.turretAnimUtil = new AnimationUtility("enemyDroneTurret", this.shape, 3);

	Turret.prototype.init.call(this);

	this.firingState = Turret.FIRE_TYPES.DEFAULT;
	this.currentProjectileSystem = this.arrProjectileSystems[this.firingState];
	this.fire = this.defaultFire;
};

/**
*@override
*@public				
*/
EnemyDroneTurret.prototype.update = function(options) {	
	if(this.hasAI) {
		this.aiControl(options);

		this.turretAnimUtil.update();
	} else {
		this.manualControl();

		this.turretAnimUtil.update();
	}
};

EnemyDroneTurret.prototype.defaultFire = function() {
	var deg,
		firingPosDeg,
		firingPosSin,
		firingPosCos,
		trigTable = app.trigTable,
		vector2D = new app.b2Vec2(),
		stage = this.shape.getStage(),
		projectile = null,
		i = -1,
		length = EnemyDroneTurret.FIRE_OFFSETS.length;

	//fires 2 parallel shots simultaneously
	while(++i < length) {
		projectile = this.currentProjectileSystem.getProjectile();

		if(projectile) {
			//zero out existing linear velocity
			projectile.body.SetLinearVelocity(app.vecZero);
			
			//acquire rotation of Turret instance in degrees and add ammo at table-referenced distance			
			deg = this.shape.rotation - 90;
			sin = trigTable.sin(deg);
			cos = trigTable.cos(deg);

			//acquire values to determine firing position
			firingPosDeg = (deg + EnemyDroneTurret.FIRE_OFFSETS[i]);
			firingPosSin = trigTable.sin(firingPosDeg);
			firingPosCos = trigTable.cos(firingPosDeg); 
			
			vector2D.x = ((this.shape.parent.x + this.shape.x) / app.physicsScale) + (firingPosCos * this.ammoDistance);
			vector2D.y = ((this.shape.parent.y + this.shape.y) / app.physicsScale) + (firingPosSin * this.ammoDistance);				
			projectile.body.SetPosition(vector2D);

			vector2D.x = cos * projectile.velocityMod;
			vector2D.y = sin * projectile.velocityMod;				
			projectile.body.ApplyForce(vector2D, projectile.body.GetWorldCenter());

			projectile.setIsAlive(true);

			this.turretAnimUtil.play();
			
			stage.addChild(projectile.shape);
		}
	}
};