goog.provide('BladeTurret');

goog.require('Turret');
goog.require('PlayerTank');

/**
*@constructor
*Main turret/cannon used in play
*/
BladeTurret = function(hasAI, arrProjectileSystems) {
	Turret.call(this, hasAI, arrProjectileSystems);

	this.offsetLength = 0;

	this.stateMachine = null;
	
	this.init();
};

goog.inherits(BladeTurret, Turret);

BladeTurret.FIRE_OFFSETS = {
	ALT: [0, 90, 180, 270]
};

/**
*@override
*@public
*/
BladeTurret.prototype.init = function() {
	this.fireThreshold = 2;
	this.fireCounter = this.fireThreshold - 1;

	this.energyConsumption = -PlayerTank.MAX_ENERGY / 40;

	this.shape = new createjs.BitmapAnimation(app.assetsProxy.arrSpriteSheet["bladeTurret"]);
	this.shape.regX = 47;
	this.shape.regY = 47;
	this.shape.gotoAndStop(0);

	this.offsetLength = BladeTurret.FIRE_OFFSETS.ALT.length;

	this.setStateMachine();
	this.setFiringState(Turret.FIRE_TYPES.DEFAULT);

	Turret.prototype.init.call(this);
};

/**
*@override
*@public
*/
BladeTurret.prototype.update = function(options) {
	Turret.prototype.update.call(this, options);

	this.stateMachine.update(options);
};

/**
*@override
*@public				
*/
BladeTurret.prototype.enterDefaultFire = function(options) {
	Turret.prototype.enterDefaultFire.call(this, options);

	this.shape.gotoAndStop(0);
};

/**
*@override
*@public				
*/
BladeTurret.prototype.enterAltFire = function(options) {
	Turret.prototype.enterAltFire.call(this, options);

	this.shape.gotoAndStop(1);
};

/**
*@public				
*/
BladeTurret.prototype.updateDefaultFire = function(options) {	
	
};

/**
*@public				
*/
BladeTurret.prototype.updateAltFire = function(options) {
	
};

BladeTurret.prototype.defaultFire = function() {
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

		projectile.setIsAlive(true);
		
		vector2D.x = cos * projectile.velocityMod;
		vector2D.y = sin * projectile.velocityMod;				
		projectile.body.ApplyForce(vector2D, projectile.body.GetWorldCenter());
		
		projectile.shape.rotation = this.shape.rotation;
		stage.addChild(projectile.shape);
	}
};

BladeTurret.prototype.altFire = function() {
	var deg,
		sin,
		cos,
		vector2D,
		stage = this.shape.getStage(),
		projectile = null,
		i = -1;

	while(++i < this.offsetLength) {
		projectile = this.currentProjectileSystem.getProjectile();

		if(projectile) {
			vector2D = new app.b2Vec2();
			
			//zero out existing linear velocity
			projectile.body.SetLinearVelocity(vector2D);
			
			//acquire rotation of Turret instance in degrees and add ammo at table-referenced distance			
			deg = this.shape.rotation - 90;
			deg += BladeTurret.FIRE_OFFSETS.ALT[i];
			sin = app.trigTable.sin(deg);
			cos = app.trigTable.cos(deg);
			
			vector2D.x = ((this.shape.parent.x + this.shape.x) / app.physicsScale) + (cos * this.ammoDistance);
			vector2D.y = ((this.shape.parent.y + this.shape.y) / app.physicsScale) + (sin * this.ammoDistance);				
			projectile.body.SetPosition(vector2D);

			vector2D.x = cos * projectile.velocityMod;
			vector2D.y = sin * projectile.velocityMod;				
			projectile.body.ApplyForce(vector2D, projectile.body.GetWorldCenter());

			projectile.setIsAlive(true);
			
			projectile.shape.rotation = deg + 90;
			stage.addChild(projectile.shape);
		}
	}
};