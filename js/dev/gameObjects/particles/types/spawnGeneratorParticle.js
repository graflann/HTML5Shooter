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

	this.stateMachine = null;
	
	this.init();
};

goog.inherits(SpawnGeneratorParticle, Particle)

/**
*@override
*@public
*/
SpawnGeneratorParticle.prototype.init = function() {
	this.shape = new createjs.Shape();

	Particle.prototype.init.call(this);

	this.radius = 64;
	this.maxRadius = 64;

	this.setStateMachine();
};

/**
*@override
*@public
*/
SpawnGeneratorParticle.prototype.update = function(options) {
	if (this.isAlive) {
		//redraw ball for dynamic fx
		if(createjs.Ticker.getTicks() % 5 == 0) {
			var randRadius = Math.randomInRange(0.85, 1) * this.radius,
				randOrigin = Math.randomInRange(0.1, 0.5) * this.radius;

			this.shape.graphics.clear();

			this.shape.alpha = Math.randomInRange(0.25, 0.5);

			this.shape.graphics
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
	}
};

/**
*@override
*@public
*/
SpawnGeneratorParticle.prototype.kill = function() {
	Particle.prototype.kill.call(this);

	this.shape.alpha = 0;

	this.isAlive = false;
};

/**
*@public
*/
SpawnGeneratorParticle.prototype.setMaxRadius = function(value) {
	this.maxRadius = value;
};

/**
*@private
*/
SpawnGeneratorParticle.prototype.setStateMachine = function() {
	this.stateMachine = new StateMachine();

	this.stateMachine.addState(
		State.KEY,
		new State(),
		[ ParticleInitializationState.KEY ]
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