goog.provide('BladeTurret');

goog.require('Turret');

/**
*@constructor
*Main turret/cannon used in play
*/
BladeTurret = function(color, projectileSystem, hasAI) {
	Turret.call(this, color, projectileSystem, hasAI);
	
	this.init();
};

goog.inherits(BladeTurret, Turret);

/**
*@override
*@public
*/
BladeTurret.prototype.init = function() {
	this.fireThreshold = 2;
	this.fireCounter = this.fireThreshold - 1;

	this.shape = new createjs.Shape();
	this.shape.graphics.ss(2).s(this.color).f("#F00").dr(-4, 0, 8, -32).f("#F00").dc(0, 0, 12);
};

BladeTurret.prototype.fire = function() {
	var deg,
		sin,
		cos,
		vector2D,
		stage = this.shape.getStage(),
		projectile = this.projectileSystem.getProjectile();

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
		//projectile.shape.play();
	}
};