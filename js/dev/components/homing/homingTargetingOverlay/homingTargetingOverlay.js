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

	this.radius = Constants.WIDTH * 0.5;

	this.isActive = false;

	this.stateMachine = null;
	
	this.init();
};

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