goog.provide('GrenadeTurret');

goog.require('Turret');

/**
*@constructor
*Main turret/cannon used in play
*/
GrenadeTurret = function(color, projectileSystem, hasAI) {
	Turret.call(this, color, projectileSystem, hasAI);
	
	this.init();
};

goog.inherits(GrenadeTurret, Turret);

/**
*@override
*@public
*/
GrenadeTurret.prototype.init = function() {
	this.fireThreshold = 4;
	this.fireCounter = this.fireThreshold - 1;

	this.shape = new createjs.Shape();
	this.shape.graphics.ss(2).s(this.color).f("#0F0").dr(-4, 0, 8, -32).f("#0F0").dc(0, 0, 12);
};

GrenadeTurret.prototype.fire = function() {
	var deg,
		sin,
		cos,
		vector2D,
		stage = this.shape.getStage(),
		projectile = this.projectileSystem.getProjectile(),
		offset = Math.randomInRange(-0.0625, 0.0625);

	if(projectile) {
		vector2D = new app.b2Vec2();
		
		//zero out existing linear velocity
		projectile.body.SetLinearVelocity(vector2D);
		
		//remove ammo from stage if present
		if(stage.getChildIndex(projectile.shape) > -1)
			stage.removeChild(projectile.shape);
		
		//acquire rotation of Turret instance in degrees and add ammo at table-referenced distance			
		deg = this.shape.rotation - 90;
		sin = app.trigTable.sin(deg);
		cos = app.trigTable.cos(deg);
		
		vector2D.x = ((this.shape.parent.x + this.shape.x) / app.physicsScale) + (cos * this.ammoDistance);
		vector2D.y = ((this.shape.parent.y + this.shape.y) / app.physicsScale) + (sin * this.ammoDistance);				
		projectile.body.SetPosition(vector2D);

		projectile.setIsAlive(true);
		
		vector2D.x = (cos + offset) * projectile.velocityMod;
		vector2D.y = (sin + offset) * projectile.velocityMod;				
		projectile.body.ApplyForce(vector2D, projectile.body.GetWorldCenter());
		
		stage.addChild(projectile.shape);
	}
};