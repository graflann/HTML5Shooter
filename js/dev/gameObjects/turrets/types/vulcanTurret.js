goog.provide('VulcanTurret');

goog.require('Turret');
goog.require('AnimationUtility');

/**
*@constructor
*Main turret/cannon used in play
*/
VulcanTurret = function(color, projectileSystem, hasAI) {
	Turret.call(this, color, projectileSystem, hasAI);

	this.turretAnimUtil = null;

	this.fireOffset = 0.0625;
	
	this.init();
};

goog.inherits(VulcanTurret, Turret);

/**
*@override
*@public
*/
VulcanTurret.prototype.init = function() {
	this.fireThreshold = 4;
	this.fireCounter = this.fireThreshold - 1;

	this.ammoDistance = 48 / app.physicsScale;

	this.shape = new createjs.BitmapAnimation(app.assetsProxy.arrSpriteSheet["vulcanTurret"]);
	this.shape.regX = 16;
	this.shape.regY = 44;
	this.shape.gotoAndStop("vulcanTurret");

	this.turretAnimUtil = new AnimationUtility("vulcanTurret", this.shape, 2);
	this.turretAnimUtil.loop(true);
};

/**
*@override
*@public				
*/
VulcanTurret.prototype.update = function(options) {	
	if(this.hasAI) {
		this.aiControl(options);
	} else {
		this.manualControl();

		(this.isFiring) ? this.turretAnimUtil.play() : this.turretAnimUtil.stop();
		this.turretAnimUtil.update();
	}
};

VulcanTurret.prototype.fire = function() {
	var deg,
		sin,
		cos,
		vector2D,
		stage = this.shape.getStage(),
		projectile = this.projectileSystem.getProjectile(),
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
	}
};