goog.provide('ParryParticle');

goog.require('Particle');

/**
*@constructor
*/
ParryParticle = function() {
	Particle.call(this);

	this.inc = 0;

	this.radius = 0;
	
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
	//this.shape.scaleX = this.shape.scaleY = 0;

	this.collisionRoutingObject = new CollisionRoutingObject();
	this.collisionRoutingObject.type = ParticleTypes.PARRY;
};

ParryParticle.MIN_ALPHA = 0// 0.15;
ParryParticle.MAX_ALPHA = 0.65// 0.65;
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
			table = app.trigTable,
			deg = turret.shape.rotation - 90,
			cos = table.cos(deg) * ParryParticle.DISTANCE,
			sin = table.sin(deg) * ParryParticle.DISTANCE;

		this.shape.x = target.position.x + cos;
		this.shape.y = target.position.y + sin;
		this.shape.alpha += this.inc;

		if(this.shape.alpha >= ParryParticle.MAX_ALPHA) {
			this.inc = -ParryParticle.INC;
		}
			
		if(this.shape.alpha < 0) {
			this.kill();
		}
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
	//this.shape.scaleX = this.shape.scaleY = 0;

	this.inc = ParryParticle.INC;
	
	this.isAlive = true;
	
	app.layers.getStage(LayerTypes.MAIN).addChild(this.shape);
};

/**
*@override
*@public
*/
ParryParticle.prototype.kill = function() {
	Particle.prototype.kill.call(this);

	this.shape.alpha = 0;
	//this.shape.scaleX = this.shapeScaleY = 0;
};

ParryParticle.prototype.setPhysics = function() {

};