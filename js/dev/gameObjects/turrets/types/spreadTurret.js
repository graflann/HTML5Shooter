goog.provide('SpreadTurret');

goog.require('Turret');

/**
*@constructor
*Spread turret with alt reflect fire
*/
SpreadTurret = function(hasAI, arrProjectileSystems) {	
	Turret.call(this, hasAI, arrProjectileSystems);

	this.stateMachine = null;

	this.arrFireOffsets = [0, 10, -10, 20, -20, 30, -30];

	this.maxSpread = 3;
	
	this.init();
};

goog.inherits(SpreadTurret, Turret);

/**
*@override
*@public
*/
SpreadTurret.prototype.init = function() {
	this.fireThreshold = 18;
	this.fireCounter = this.fireThreshold - 1;

	this.energyConsumption = -30;

	this.shape = new createjs.BitmapAnimation(app.assetsProxy.arrSpriteSheet["spreadTurret"]);
	this.shape.regX = 16;
	this.shape.regY = 44;
	this.shape.gotoAndStop(0);

	Turret.prototype.init.call(this);
	this.setStateMachine();
};

SpreadTurret.prototype.fire = function() {
	var deg,
		sin,
		cos,
		vector2D,
		stage = this.shape.getStage(),
		projectile = null,
		i = -1;

	while(++i < this.maxSpread) {
		projectile = this.currentProjectileSystem.getProjectile();

		if(projectile) {
			vector2D = new app.b2Vec2();
			
			//zero out existing linear velocity
			projectile.body.SetLinearVelocity(vector2D);
			
			//acquire rotation of Turret instance in degrees and add ammo at table-referenced distance			
			deg = this.shape.rotation - 90;
			sin = app.trigTable.sin(deg);
			cos = app.trigTable.cos(deg);
			
			vector2D.x = ((this.shape.parent.x + this.shape.x)/ app.physicsScale) + (cos * this.ammoDistance);
			vector2D.y = ((this.shape.parent.y + this.shape.y) / app.physicsScale) + (sin * this.ammoDistance);				
			projectile.body.SetPosition(vector2D);

			if(i > 0) {
				deg += this.arrFireOffsets[i];
				sin = app.trigTable.sin(deg);
				cos = app.trigTable.cos(deg);
			}
			
			vector2D.x = cos * projectile.velocityMod;
			vector2D.y = sin * projectile.velocityMod;		
			projectile.body.ApplyForce(vector2D, projectile.body.GetWorldCenter());

			projectile.setIsAlive(true);
			
			projectile.shape.rotation = this.shape.rotation;
			stage.addChild(projectile.shape);
		}
	}
};

SpreadTurret.prototype.altFire = function() {
	var deg,
		sin,
		cos,
		vector2D,
		stage = this.shape.getStage(),
		projectile = null,
		i = -1;

	while(++i < this.maxSpread) {
		projectile = this.currentProjectileSystem.getProjectile();

		if(projectile) {
			vector2D = new app.b2Vec2();
			
			//zero out existing linear velocity
			projectile.body.SetLinearVelocity(vector2D);
			
			//acquire rotation of Turret instance in degrees and add ammo at table-referenced distance			
			deg = this.shape.rotation - 90;
			sin = app.trigTable.sin(deg);
			cos = app.trigTable.cos(deg);
			
			vector2D.x = ((this.shape.parent.x + this.shape.x)/ app.physicsScale) + (cos * this.ammoDistance);
			vector2D.y = ((this.shape.parent.y + this.shape.y) / app.physicsScale) + (sin * this.ammoDistance);				
			projectile.body.SetPosition(vector2D);

			if(i > 0) {
				deg += this.arrFireOffsets[i];
				sin = app.trigTable.sin(deg);
				cos = app.trigTable.cos(deg);
			}
			
			vector2D.x = cos * projectile.velocityMod;
			vector2D.y = sin * projectile.velocityMod;		
			projectile.body.ApplyForce(vector2D, projectile.body.GetWorldCenter());

			projectile.setIsAlive(true);
			
			projectile.shape.rotation = this.shape.rotation;
			stage.addChild(projectile.shape);
		}
	}
};