goog.provide('SpawnGeneratorParticle');

goog.require('Particle');
goog.require('StateMachine');
goog.require('ParticleInitializationState');
goog.require('ParticleOperationState');
goog.require('ParticleRemovalState');

/**
*@constructor
*/
SpawnGeneratorParticle = function(color, altColor) {
	Particle.call(this, color);

	this.altColor = altColor;

	this.radius = 0;

	this.maxRadius = 0;

	this.alpha = 0;

	this.scaleInc = 0;

	this.stateMachine = null;
	
	this.init();
};

goog.inherits(SpawnGeneratorParticle, Particle);

SpawnGeneratorParticle.ALPHA_INC = 1 / 120;

/**
*@override
*@public
*/
SpawnGeneratorParticle.prototype.init = function() {
	this.shape = new createjs.Shape();
	this.shape.alpha = 0;

	Particle.prototype.init.call(this);

	this.radius = 0;
	this.setMaxRadius(64);
	this.alpha = 0;

	this.setStateMachine();
};

/**
*@override
*@public
*/
SpawnGeneratorParticle.prototype.update = function(options) {
	if (this.isAlive) {
		this.stateMachine.update(options);

		this.updateFX(options);
	}
};

SpawnGeneratorParticle.prototype.updateFX = function(options) {
	//redraw ball for dynamic fx
	if(createjs.Ticker.getTicks() % 5 == 0) {
		var randRadius = Math.randomInRange(0.85, 1) * this.radius,
			randOrigin = Math.randomInRange(0.1, 0.5) * this.radius;

		this.shape.alpha = Math.randomInRange(this.alpha * 0.5, this.alpha);

		this.shape.graphics
			.c()
			.ss(1)
			.s(Constants.RED)
			.rf([Constants.RED, Constants.DARK_RED], [0, 1], 0, 0, this.radius * 0.5, 0, 0, this.radius)
			.dc(0, 0, randRadius)
			.ss(Math.randomInRange(1, 3))
			.s(Constants.YELLOW)
			.mt(randOrigin, randOrigin)
			.lt(0, randRadius)
			.mt(-randOrigin, -randOrigin)
			.lt(randRadius, 0)
			.mt(randOrigin, randOrigin)
			.lt(0, -randRadius)
			.mt(-randOrigin, -randOrigin)
			.lt(-randRadius, 0);
	}

	this.shape.rotation += Math.randomInRange(-90, 90);
};


SpawnGeneratorParticle.prototype.enterInitialization = function(options) {};

SpawnGeneratorParticle.prototype.updateInitialization = function(options) {
	this.radius += this.scaleInc;
	this.alpha += SpawnGeneratorParticle.ALPHA_INC;

	if(this.radius >= this.maxRadius) {
		this.radius = this.maxRadius;

		this.stateMachine.setState(ParticleOperationState.KEY);
	}
};

SpawnGeneratorParticle.prototype.exitInitialization = function(options) {};


SpawnGeneratorParticle.prototype.enterOperation = function(options) {};

SpawnGeneratorParticle.prototype.updateOperation = function(options) {};

SpawnGeneratorParticle.prototype.exitOperation = function(options) {};


SpawnGeneratorParticle.prototype.enterRemoval = function(options) {};

SpawnGeneratorParticle.prototype.updateRemoval = function(options) {
	this.radius -= this.scaleInc;
	this.alpha -= SpawnGeneratorParticle.ALPHA_INC;

	if(this.radius <= 0) {
		//this.stateMachine.setState(State.KEY);
		this.kill();
	}
};

SpawnGeneratorParticle.prototype.exitRemoval  = function(options) {
	//this.kill();
};

SpawnGeneratorParticle.prototype.onRemove = function(e) {
	var wave = e.target;

	console.log("Spawn particle initing removal: " + this.stateMachine.getCurrentState());

	goog.events.unlisten(
		wave, 
		EventNames.REMOVE_SPAWN_PARTICLE, 
		this.onRemove,
		false, 
		this
	);

	this.stateMachine.setState(ParticleRemovalState.KEY);
};

/**
*@override
*@public
*/
SpawnGeneratorParticle.prototype.create = function(options) {
	this.shape.x = Math.randomInRange(
		options.posX - options.posOffsetX, 
		options.posX + options.posOffsetX
	);
	this.shape.y = Math.randomInRange(
		options.posY - options.posOffsetY, 
		options.posY + options.posOffsetY
	);
	
	this.velocity.x = Math.randomInRange(-options.velX, options.velX);
	this.velocity.y = Math.randomInRange(-options.velY, options.velY);

	if(options.isRotated) {
		this.shape.rotation = Math.randomInRange(0, 360);
	}
	
	this.isAlive = true;
	
	//enemy bodies need to rended on MAIN, the layer below this one so it looks right
	app.layers.getStage(LayerTypes.FOREGROUND).addChild(this.shape);

	this.stateMachine.setState(ParticleInitializationState.KEY);
};

/**
*@override
*@public
*/
SpawnGeneratorParticle.prototype.kill = function() {
	if(this.isAlive) {
		this.shape.getStage().removeChild(this.shape);
		this.isAlive = false;

		this.shape.alpha = 0;
		this.radius = 0;
		this.alpha = 0;

		this.stateMachine.setState(State.KEY);
	}
};

/**
*@public
*/
SpawnGeneratorParticle.prototype.setMaxRadius = function(value) {
	this.maxRadius = value;

	this.scaleInc = this.maxRadius / createjs.Ticker.getFPS();
};

/**
*@private
*/
SpawnGeneratorParticle.prototype.setStateMachine = function() {
	this.stateMachine = new StateMachine();

	this.stateMachine.addState(
		State.KEY,
		new State(),
		[ ParticleInitializationState.KEY, ParticleRemovalState.KEY ]
	);

	this.stateMachine.addState(
		ParticleInitializationState.KEY, 	
		new ParticleInitializationState(this), 	
		[
			ParticleOperationState.KEY,
			ParticleRemovalState.KEY
		]
	);

	this.stateMachine.addState(
		ParticleOperationState.KEY, 	
		new ParticleOperationState(this), 	
		[
			ParticleRemovalState.KEY
		]
	);

	this.stateMachine.addState(
		ParticleRemovalState.KEY, 	
		new ParticleRemovalState(this), 	
		[
			State.KEY,
			ParticleInitializationState.KEY
		]
	);
	
	this.stateMachine.setState(State.KEY);
};