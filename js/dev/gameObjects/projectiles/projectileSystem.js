goog.provide('ProjectileSystem');

goog.require('Projectile');
goog.require('ProjectileClasses');

/**
*@constructor
*System managing projectiles
*/
ProjectileSystem = function(type, color, max, categoryBits, maskBits, secondaryProjectileSystem) {
	this.type = type;

	this.color = color;

	this.max = max || 8;

	this.categoryBits = categoryBits || CollisionCategories.PLAYER_PROJECTILE;

	this.maskBits = maskBits || CollisionCategories.GROUND_ENEMY | CollisionCategories.SCENE_OBJECT;

	this.secondaryProjectileSystem = secondaryProjectileSystem || null;

	this.isActive = true;

	this.arrProjectiles = new Array(this.max);

	this.init();
};

goog.inherits(ProjectileSystem, goog.events.EventTarget);

ProjectileSystem.prototype.init = function() {
	var ProjectileClass = ProjectileClasses[this.type],
		i = -1;

	while(++i < this.max) {
		if(this.secondaryProjectileSystem) {
			this.arrProjectiles[i] = new ProjectileClass(this.color, this.categoryBits, this.maskBits, this.secondaryProjectileSystem);
		} else {
			this.arrProjectiles[i] = new ProjectileClass(this.color, this.categoryBits, this.maskBits);
		}
	}
};

ProjectileSystem.prototype.update = function(options) {
	var i = -1;

	while(++i < this.max) {
		this.arrProjectiles[i].update(options);
	}
};

ProjectileSystem.prototype.clear = function() {
	var i = -1;

	while(++i < this.max) {
		this.arrProjectiles[i].clear();
		this.arrProjectiles[i] = null;
	}
	
	this.arrProjectiles.length = 0;
	this.arrProjectiles = null;
};

ProjectileSystem.prototype.kill = function() {
	var i = -1;

	while(++i < this.max) {
		this.arrProjectiles[i].kill();
	}
};

ProjectileSystem.prototype.getProjectile = function() {
	var i = -1,
		projectile;

	while(++i < this.max){
		projectile = this.arrProjectiles[i];

		if (!projectile.isAlive){
			return projectile;
		}
	}
	
	return null;
};

ProjectileSystem.prototype.getIsAlive = function() {
	var i = -1;
			
	while (++i < this.max){
		if(this.arrProjectiles[i].isAlive) {
			return true;
		}
	}
	
	return false;
};

ProjectileSystem.prototype.setVelocityMod = function(value) {
	var i = -1;
			
	while (++i < this.max){
		this.arrProjectiles[i].velocityMod = value;
	}
};

ProjectileSystem.prototype.length = function(){
	return this.arrProjectiles.length;
};
