goog.provide('ParryParticle');

goog.require('Particle');
goog.require('CollisionCategories');

/**
*@constructor
*/
ParryParticle = function() {
	Particle.call(this);

	this.inc = 0;

	this.radius = 0;

	this.body = null;

	this.physicalPosition = null;

	this.debugShape = null;
	
	this.init();
};

goog.inherits(ParryParticle, Particle)

/**
*@override
*@public
*/
ParryParticle.prototype.init = function() {
	Particle.prototype.init.call(this);

	this.radius = Constants.UNIT;

	this.shape = new createjs.Shape();
	this.shape.graphics
		.ss(1)
		.s(Constants.BLUE)
		.rf([Constants.BLUE, Constants.DARK_BLUE], [0, 1], 0, 0, this.radius * 0.25, 0, 0, this.radius)
		.dc(0, 0, this.radius);
	this.shape.alpha = 0;

	this.collisionRoutingObject = new CollisionRoutingObject();
	this.collisionRoutingObject.type = ParticleTypes.PARRY;

	this.physicalPosition = new app.b2Vec2();

	this.setPhysics();
};

ParryParticle.MIN_ALPHA = 0;
ParryParticle.MAX_ALPHA = 0.65;
ParryParticle.INC = (ParryParticle.MAX_ALPHA - ParryParticle.MIN_ALPHA) / 15;
ParryParticle.DISTANCE = Constants.UNIT * 2;

/**
*@override
*@public
*/
ParryParticle.prototype.update = function(options) {
	if (this.isAlive) {
		var target = options.target,
			turret = target.getTurret(),
			scale = app.physicsScale,
			table = app.trigTable,
			deg = turret.shape.rotation - 90,
			cos = table.cos(deg) * ParryParticle.DISTANCE,
			sin = table.sin(deg) * ParryParticle.DISTANCE;

		this.position.x = this.shape.x = (target.position.x + cos);
		this.position.y = this.shape.y = (target.position.y + sin); 
		this.shape.alpha += this.inc;

		this.physicalPosition.x = this.position.x / scale;
		this.physicalPosition.y = this.position.y / scale;

		this.body.SetPosition(this.physicalPosition);

		if(this.shape.alpha >= ParryParticle.MAX_ALPHA) {
			this.inc = -ParryParticle.INC;
		} else if(this.shape.alpha < 0) {
			this.kill();
		}

		this.updateDebug();
	}
};

/**
*@private
*/
ParryParticle.prototype.updateDebug = function() {
	if(app.physicsDebug) {

		if(this.debugShape.parent === null || this.debugShape.parent === undefined) {
			this.shape.getStage().addChild(this.debugShape);
		}

		this.debugShape.x = (this.physicalPosition.x * app.physicsScale);
		this.debugShape.y = (this.physicalPosition.y * app.physicsScale);

	} else if (!app.physicsDebug && (this.debugShape.parent != null || this.debugShape.parent != undefined)) {
		this.shape.getStage().removeChild(this.debugShape);
	}
};

/**
*@override
*@public
*/
ParryParticle.prototype.create = function(options) {
	var target = options.target;

	this.shape.rotation = target.baseContainer.rotation;
	this.shape.x = target.position.x;
	this.shape.y = target.position.y;
	this.shape.alpha = 0;

	this.inc = ParryParticle.INC;
	
	this.body.SetAwake(true);
	this.body.SetActive(true);
	this.isAlive = true;
	
	app.layers.getStage(LayerTypes.MAIN).addChild(this.shape);
};

/**
*@override
*@public
*/
ParryParticle.prototype.kill = function() {
	if(this.isAlive) {
		this.shape.getStage().removeChild(this.shape);

		this.isAlive = false;
		this.body.SetAwake(false);
		this.body.SetActive(false);

		this.shape.alpha = 0;
	}
};

ParryParticle.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		fixDefRadius = this.radius / app.physicsScale,
		bodyDef = new app.b2BodyDef();

	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = CollisionCategories.PARRY;
	fixDef.filter.maskBits = CollisionCategories.GROUND_ENEMY_PROJECTILE | CollisionCategories.AIR_ENEMY_PROJECTILE;
	fixDef.isSensor = true;
	fixDef.shape = new app.b2CircleShape(fixDefRadius);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetAwake(false);
	this.body.SetActive(false);
	this.body.SetPosition(this.physicalPosition);

	//set the Shape instance that renders the body in debug mode
	this.debugShape = new createjs.Shape();
	this.debugShape.graphics
		.f(Constants.GREEN)
		.dc(0, 0, this.radius);
	this.debugShape.alpha = 0.5;
};