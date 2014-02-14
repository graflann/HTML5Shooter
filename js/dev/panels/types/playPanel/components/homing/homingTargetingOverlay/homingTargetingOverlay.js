goog.provide('HomingTargetingOverlay');

goog.require('StateMachine');
goog.require('HomingTargetingOverlayInitializationState');
goog.require('HomingTargetingOverlayOperationState');
goog.require('HomingTargetingOverlayRemovalState');

/**
*@constructor
*HomingTargetingOverlay component
*/
HomingTargetingOverlay = function() {	
	/**
	*@type {Shape}
	*/
	this.container = null;

	this.body = null;

	/**
	*@type {Shape}
	*/
	this.background = null;

	/**
	*@type {Shape}
	*/
	this.arrReticles = [];

	this.position = new app.b2Vec2();

	this.physicalPosition = new app.b2Vec2();

	this.radius = Constants.WIDTH * 0.375;

	this.scalar = HomingTargetingOverlayOperationState.SCALAR;

	this.isActive = false;

	this.stateMachine = null;
	
	this.init();
};

HomingTargetingOverlay.MAX_RADIUS = Constants.WIDTH * 0.375;

HomingTargetingOverlay.RADIUS_INC = (HomingTargetingOverlay.MAX_RADIUS * 0.001);

/**
*@public
*/
HomingTargetingOverlay.prototype.init = function() {
	this.container = new createjs.Container();

	this.background = new createjs.Shape();

	this.arrReticles[0] = new createjs.Shape();
	this.arrReticles[0].alpha = 0.15;

	this.arrReticles[1] = new createjs.Shape();
	this.arrReticles[1].alpha = 0.5;

	this.arrReticles[2] = new createjs.Shape();
	this.arrReticles[2].alpha = 0.5;

	this.background.alpha = 0;
	this.container.scaleX = this.container.scaleY = 0;
	this.container.addChild(this.background);

	this.setPhysics();

	this.setStateMachine();
};

/**
*@public
*/
HomingTargetingOverlay.prototype.update = function(options) {
	if(this.isActive) {
		var player = options.player;

		this.position.x = this.container.x = player.position.x;
		this.position.y = this.container.y = player.position.y;

		this.stateMachine.update();
	}
};

/**
*@public
*/
HomingTargetingOverlay.prototype.enterInitialization = function(options) {
	this.isActive = true;

	// if(this.background.graphics.isEmpty()) {
	// 	this.background.graphics
	// 		.ss(2)
	// 		.s(Constants.LIGHT_BLUE)
	// 		.f(Constants.BLUE)
	// 		.dc(0, 0, this.radius);
	// }

	this.background.alpha = 0;
	this.container.scaleX = this.container.scaleY = 0;

	app.layers.getStage(LayerTypes.HOMING).addChild(this.container);

	this.stateMachine.setState(HomingTargetingOverlayOperationState.KEY);
};

/**
*@public
*/
HomingTargetingOverlay.prototype.updateInitialization = function(options) {
	// var container = this.container,
	// 	background = this.background;

	// background.alpha += 0.00125;

	// if(background.alpha > 0.125) {
	// 	background.alpha = 0.125;
	// }

	// container.scaleX = container.scaleY += 0.0375;

	// if(container.scaleX > 1) {
	// 	container.scaleX = container.scaleY = 1;

	// 	this.stateMachine.setState(HomingTargetingOverlayOperationState.KEY);
	// }
};

/**
*@public
*/
HomingTargetingOverlay.prototype.exitInitialization = function(options) {

};

/**
*@public
*/
HomingTargetingOverlay.prototype.enterOperation = function(options) {
	//TOP RETICLE
	// if(this.arrReticles[0].graphics.isEmpty()) {
	// 	this.arrReticles[0].graphics
	// 		.ss(4)
	// 		.s(Constants.LIGHT_BLUE)
	// 		.dc(0, 0, this.radius)
	// 		.mt(0, 0)
	// 		.dc(0, 0, this.radius * 0.5)
	// 		.mt(0, 0)
	// 		.lt(this.radius, 0)
	// 		.mt(0, 0)
	// 		.lt(0, this.radius);
	// }

	// //BOTTOM RETICLE
	// if(this.arrReticles[1].graphics.isEmpty()) {
	// 	this.arrReticles[1].graphics
	// 		.ss(4)
	// 		.s(Constants.DARK_BLUE)
	// 		.mt(0, 0)
	// 		.lt(this.radius, 0)
	// 		.mt(0, 0)
	// 		.lt(0, this.radius);
	// }

	// //MIDDLE ANIMATED ELLIPSE
	// if(this.arrReticles[2].graphics.isEmpty()) {
	// 	this.arrReticles[2].graphics
	// 		.ss(4)
	// 		.s(Constants.BLUE)
	// 		.dc(0, 0, this.radius);
	// }

	this.container.addChild(this.arrReticles[1]);
	this.container.addChild(this.arrReticles[2]);
	this.container.addChild(this.arrReticles[0]);

	this.body.SetAwake(true);
	this.body.SetActive(true);
};

/**
*@public
*/
HomingTargetingOverlay.prototype.updateOperation = function(options) {
	var scale = app.physicsScale,
		reticle2 = this.arrReticles[2];

	this.background.graphics.clear();
	this.arrReticles[0].graphics.clear();
	this.arrReticles[1].graphics.clear();
	this.arrReticles[2].graphics.clear();

	this.background.graphics
		.ss(2)
		.s(Constants.LIGHT_BLUE)
		.f(Constants.BLUE)
		.dc(0, 0, this.radius);

	this.arrReticles[0].graphics
		.ss(4)
		.s(Constants.LIGHT_BLUE)
		.dc(0, 0, this.radius)
		.mt(0, 0)
		.dc(0, 0, this.radius * 0.5)
		.mt(0, 0)
		.lt(this.radius, 0)
		.mt(0, 0)
		.lt(0, this.radius);

	this.arrReticles[1].graphics
		.ss(4)
		.s(Constants.DARK_BLUE)
		.mt(0, 0)
		.lt(this.radius, 0)
		.mt(0, 0)
		.lt(0, this.radius);

	this.arrReticles[2].graphics
		.ss(4)
		.s(Constants.BLUE)
		.dc(0, 0, this.radius);

	//UPDATE BACKGROUND OPACITY
	if(this.background.alpha < 0.125) {
		this.background.alpha += 0.00125;
	}

	//ROTATE TOP AND BOTTOM
	this.arrReticles[0].rotation += 4;
	this.arrReticles[1].rotation -= 2;

	//ROTATE AND SCALE MIDDLE
	reticle2.rotation += 3;

	if(reticle2.scaleX <  -1) {
		reticle2.scaleX = -1;
		this.scalar *= -1;
	} else if(reticle2.scaleX >  1) {
		reticle2.scaleX = 1;
		this.scalar *= -1;
	}

	reticle2.scaleX += this.scalar;

	//UPDATE POSITION OF COLLISION BODY
	this.physicalPosition.x = this.position.x / scale;
	this.physicalPosition.y = this.position.y / scale;

	this.body.SetPosition(this.physicalPosition);
};

/**
*@public
*/
HomingTargetingOverlay.prototype.exitOperation = function(options) {
	this.arrReticles[0].graphics.clear();
	this.arrReticles[1].graphics.clear();
	this.arrReticles[2].graphics.clear();

	this.container.removeChild(this.arrReticles[0]);
	this.container.removeChild(this.arrReticles[1]);
	this.container.removeChild(this.arrReticles[2]);

	this.body.SetAwake(false);
	this.body.SetActive(false);
};

/**
*@public
*/
HomingTargetingOverlay.prototype.enterRemoval = function(options) {

};

/**
*@public
*/
HomingTargetingOverlay.prototype.updateRemoval = function(options) {
	var container = this.container,
		background = this.background;

	if(background.alpha > 0) {
		background.alpha -= 0.0025;
	}

	container.scaleX = container.scaleY -= 0.05;

	if(container.scaleX < 0) {
		container.scaleX = container.scaleY = 0;

		this.stateMachine.setState(State.KEY);
	}
};

/**
*@public
*/
HomingTargetingOverlay.prototype.exitRemoval = function(options) {
	this.background.graphics.clear();

	background.alpha = 0;

	app.layers.getStage(LayerTypes.HOMING).removeChild(this.container);

	this.isActive = false;
};

/**
*@public
*/
HomingTargetingOverlay.prototype.clear = function() {
	this.background.getStage().removeChild(this.background);
	
	this.background = null;
};

/**
*@public
*/
HomingTargetingOverlay.prototype.add = function() {
	this.stateMachine.setState(HomingTargetingOverlayInitializationState.KEY);	
};

/**
*@public
*/
HomingTargetingOverlay.prototype.increase = function(qty) {
	if(this.container.scaleX < 1) {
		var value = (HomingTargetingOverlay.RADIUS_INC * qty) / HomingTargetingOverlay.MAX_RADIUS;

		this.container.scaleX += value;
		this.container.scaleY = this.container.scaleX;
	}
};

/**
*@public
*/
HomingTargetingOverlay.prototype.remove = function() {
	this.stateMachine.setState(HomingTargetingOverlayRemovalState.KEY);
};

/**
*@public
*/
HomingTargetingOverlay.prototype.getCurrentState = function() {
	return this.stateMachine.currentKey;
};

/**
*@private
*/
HomingTargetingOverlay.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef();
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = CollisionCategories.HOMING_OVERLAY;
	fixDef.filter.maskBits = CollisionCategories.AIR_ENEMY;
	fixDef.isSensor = true;
	fixDef.shape = new app.b2CircleShape(12);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetAwake(false);
	this.body.SetActive(false);
	this.body.SetPosition(this.physicalPosition);
};

/**
*@private
*/
HomingTargetingOverlay.prototype.setStateMachine = function() {
	this.stateMachine = new StateMachine();

	this.stateMachine.addState(
		State.KEY,
		new State(),
		[ HomingTargetingOverlayInitializationState.KEY ]
	);

	this.stateMachine.addState(
		HomingTargetingOverlayInitializationState.KEY, 	
		new HomingTargetingOverlayInitializationState(this), 	
		[
			HomingTargetingOverlayOperationState.KEY,
			HomingTargetingOverlayRemovalState.KEY
		]
	);

	this.stateMachine.addState(
		HomingTargetingOverlayOperationState.KEY, 	
		new HomingTargetingOverlayOperationState(this), 	
		[
			HomingTargetingOverlayRemovalState.KEY
		]
	);

	this.stateMachine.addState(
		HomingTargetingOverlayRemovalState.KEY, 	
		new HomingTargetingOverlayRemovalState(this), 	
		[
			State.KEY,
			HomingTargetingOverlayInitializationState.KEY
		]
	);
	
	this.stateMachine.setState(State.KEY);
};

goog.exportSymbol('HomingTargetingOverlay', HomingTargetingOverlay);