goog.provide('SniperTurret');

goog.require('Turret');
goog.require('AnimationUtility');

/**
*@constructor
*Main turret/cannon used in play
*/
SniperTurret = function(color, projectileSystem, hasAI) {
	Turret.call(this, color, projectileSystem, hasAI);

	this.turretAnimUtil = null;

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

	this.turretAnimUtil = new AnimationUtility("railTurret", this.shape, 3);

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
};

/**
*@override
*@public				
*/
SniperTurret.prototype.update = function(options) {	
	if(this.hasAI) {
		this.aiControl(options);
	} else {
		this.manualControl(options);
	}

	this.turretAnimUtil.update();

	this.updateEffects();
};

SniperTurret.prototype.clear = function() {
	this.shape.removeAllEventListeners();

	Turret.prototype.clear.call(this);
};

SniperTurret.prototype.fire = function() {
	var deg,
		sin,
		cos,
		vector2D,
		stage = this.shape.getStage(),
		projectile = this.projectileSystem.getProjectile(),
		x = this.shape.x,
		y = this.shape.y,
		destX = 0,
		destY = 0,
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

		this.turretAnimUtil.play();

		//fade the ball & laser sight in upon shooting then back in
		createjs.Tween.get(this.ballEffects).to({alpha: 0, scaleX: 0, scaleY: 0}, 250).call(function(){
			createjs.Tween.get(self.ballEffects).to({alpha: 0.5, scaleX: 1, scaleY: 1}, 300);
		});

		createjs.Tween.get(this.laserSight).to({alpha: 0, scaleX: 0, scaleY: 0}, 250).call(function(){
			createjs.Tween.get(self.laserSight).to({alpha: 0.5, scaleX: 1, scaleY: 1}, 300);
		});
	}
};

SniperTurret.prototype.updateEffects = function() {
	var deg = this.shape.rotation - 90,
		trigTable = app.trigTable,
		sin = trigTable.sin(deg),
		cos = trigTable.cos(deg),
		randRadius = Math.randomInRange(8, 12),
		randOrigin = Math.randomInRange(0, 4),
		randDest = Math.randomInRange(8, randDest);

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