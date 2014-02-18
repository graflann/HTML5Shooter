goog.provide('EnemyTurret');

goog.require('Enemy');
goog.require('Turret');


/**
*@constructor
*/
EnemyTurret = function(projectileSystem) {
	Enemy.call(this);

	this.container = null;

	/**
	 * @type {Array}
	 */
	this.projectileSystem = projectileSystem;

	this.categoryBits = CollisionCategories.AIR_ENEMY;

	this.maskBits = CollisionCategories.HOMING_PROJECTILE | CollisionCategories.HOMING_OVERLAY;

	this.shape = null;

	this.turret = null;

	this.reticle = null;

	this.init();
};

goog.inherits(EnemyTurret, Enemy);

/**
*@override
*@public
*/
EnemyTurret.prototype.init = function() {
	this.container = new createjs.Container();

	this.width = 32;
	this.height = 32;

	this.shape = new createjs.Shape();
	this.shape.graphics
		.ss(1)
		.s(Constants.RED)
		.f(Constants.BLACK)
		.dr(0, 0, Constants.UNIT, Constants.UNIT);
	
	this.turret = new EnemyVulcanTurret(true, [ this.projectileSystem ]);
	this.turret.shape.x = Constants.UNIT * 0.5;
	this.turret.shape.y = Constants.UNIT * 0.5;

	this.turret.fireCounter = 0;
	this.turret.fireThreshold = 180;

	this.container.addChild(this.shape);
	this.container.addChild(this.turret.shape);

	this.setPhysics();
	
	this.setIsAlive(false);
};

/**
*@override
*@public
*/
EnemyTurret.prototype.update = function(options) {
	if(this.isAlive) {
		this.turret.update({ target: options.target.position });

		//update the homing reticle particle if applicable
		if(this.reticle) {
			this.reticle.shape.x = this.position.x;
			this.reticle.shape.y = this.position.y;
		}
	}
};

/**
*@override
*@public
*/
EnemyTurret.prototype.clear = function() {
	
};

/**
*@public
*/
EnemyTurret.prototype.kill = function() {
	if(this.isAlive) {
		this.setIsAlive(false);
		this.container.getStage().removeChild(this.container);

		this.turret.fireCounter = 0;

		if(this.reticle) {
			this.reticle.kill();
			this.reticle = null;
		}

		this.dispatchKillEvent();
	}
};

/**
*@private
*/
EnemyTurret.prototype.setPosition = function(x, y) {
	var scale = app.physicsScale,
		offset = Constants.UNIT * 0.5;

	this.container.x = x;
	this.container.y = y;

	this.position.x = this.container.x + this.turret.shape.x;
	this.position.y = this.container.y + this.turret.shape.y;

	this.physicalPosition.x = (this.container.x + offset) / scale; 
	this.physicalPosition.y = (this.container.y + offset) /scale;
	
	this.body.SetPosition(this.physicalPosition);
};

EnemyTurret.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef(),
		unit = Constants.UNIT / (app.physicsScale * 2);

	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = this.categoryBits;
	fixDef.filter.maskBits = this.maskBits;
	fixDef.shape = new app.b2PolygonShape();
	fixDef.shape.SetAsBox(unit, unit);
	
	bodyDef.type = app.b2Body.b2_staticBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetAwake(true);
};

/**
*@public
*/
EnemyTurret.prototype.onHoming = function(homingObject, options) {
	if(!this.reticle) {
		options.reticles.emit(1, {
			posX: this.container.x + this.offset,
			posY: this.container.y + this.offset
		});

		this.reticle = options.reticles.getLastAlive();
	}
};

goog.exportSymbol('EnemyTurret', EnemyTurret);