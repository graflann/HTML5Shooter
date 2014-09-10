goog.provide('TargetCursor');

goog.require('Cursor');
goog.require('StateMachine');
goog.require('TargetCursorDefaultState');
goog.require('TargetCursorContractState');
goog.require('TargetCursorFocusState');

/**
*@constructor
*/
TargetCursor = function(layer) {
	Cursor.call(this, layer);

	this.innerReticle = null;

	this.outerReticle = null;

	this.outerReticleFrame = null;

	this.stateMachine = null;

	this.scaleRate = (1 - TargetCursor.MIN_SCALE) / (createjs.Ticker.getFPS() / 4);

	this.init();
};

goog.inherits(TargetCursor, Cursor);

/**
*@override
*@public
*/
TargetCursor.prototype.init = function() {
	Cursor.prototype.init.call(this);

	this.setReticles();
	this.setStateMachine();
};

TargetCursor.ROTATION_RATE = 4;
TargetCursor.MIN_SCALE = 0.33;

/**
*@override
*@public
*/
TargetCursor.prototype.update = function(options) {
	this.stateMachine.update(options);
};

/**
*@override
*@public
*/
TargetCursor.prototype.enterDefault = function(options) {
	
};

/**
*@override
*@public
*/
TargetCursor.prototype.updateDefault = function(options) {
	this.innerReticle.rotation += TargetCursor.ROTATION_RATE;
	this.outerReticle.rotation -= TargetCursor.ROTATION_RATE;

	if(app.input.isMouseButtonDown(MouseCode.BUTTONS.LEFT)) {
		this.stateMachine.setState(TargetCursorContractState.KEY);
	}
};

/**
*@override
*@public
*/
TargetCursor.prototype.exitDefault = function(options) {
	
};


/**
*@override
*@public
*/
TargetCursor.prototype.enterContract = function(options) {
	if(this.innerReticle.rotation != this.outerReticle.rotation) {
		this.innerReticle.rotation = this.outerReticle.rotation = 0;
	}
};

/**
*@override
*@public
*/
TargetCursor.prototype.updateContract = function(options) {
	this.innerReticle.rotation += TargetCursor.ROTATION_RATE;
	this.outerReticle.rotation += TargetCursor.ROTATION_RATE;

	if(app.input.isMouseButtonDown(MouseCode.BUTTONS.LEFT)) {
		if(this.outerReticleFrame.scaleX > TargetCursor.MIN_SCALE) {
			this.outerReticleFrame.scaleX = this.outerReticleFrame.scaleY -= this.scaleRate;
		} else {
			this.outerReticleFrame.scaleX = this.outerReticleFrame.scaleY = TargetCursor.MIN_SCALE;
			this.stateMachine.setState(TargetCursorFocusState.KEY);
		}
	} else {
		if(this.outerReticleFrame.scaleX < 1) {
			this.outerReticleFrame.scaleX = this.outerReticleFrame.scaleY += this.scaleRate;
		} else {
			this.outerReticleFrame.scaleX = this.outerReticleFrame.scaleY = 1;
			this.stateMachine.setState(TargetCursorDefaultState.KEY);
		}
	}
};

/**
*@override
*@public
*/
TargetCursor.prototype.exitContract = function(options) {
	
};

/**
*@override
*@public
*/
TargetCursor.prototype.enterFocus = function(options) {
	
};

/**
*@override
*@public
*/
TargetCursor.prototype.updateFocus = function(options) {
	this.innerReticle.rotation += TargetCursor.ROTATION_RATE;
	this.outerReticle.rotation += TargetCursor.ROTATION_RATE;

	if(!app.input.isMouseButtonDown(MouseCode.BUTTONS.LEFT)) {
		this.stateMachine.setState(TargetCursorContractState.KEY);
	}
};

/**
*@override
*@public
*/
TargetCursor.prototype.exitFocus = function(options) {
	
};

/**
*@override
*@public
*/
TargetCursor.prototype.clear = function() {
	this.stateMachine.clear();
	this.stateMachine = null;
};

/**
*@override
*@public
*/
TargetCursor.prototype.setReticles = function() {
	var innerRadius = 10,
		innerCache = innerRadius + 1,
		outerRadius = 15,
		outerCache = outerRadius + 1;

	//inner
	this.innerReticle = new createjs.Shape();
	this.innerReticle.graphics
		.ss(2)
		.s(Constants.LIGHT_BLUE)
		.dc(0, 0, innerRadius)

		.mt(0, -innerRadius)
		.lt(0, -(innerRadius * 0.5))

		.mt(innerRadius, 0)
		.lt(innerRadius * 0.5, 0)

		.mt(0, innerRadius)
		.lt(0, innerRadius * 0.5)

		.mt(-innerRadius, 0)
		.lt(-(innerRadius * 0.5), 0);
	this.innerReticle.snapToPixel = true;
	//this.innerReticle.cache(-innerCache, -innerCache, (innerCache * 2), (innerCache * 2));

	//outer reticle markers
	this.outerReticle = new createjs.Shape();
	this.outerReticle.graphics
		.ss(2)
		.s(Constants.BLUE)

		.mt(0, -outerRadius)
		.lt(0, -(outerRadius * 0.66))

		.mt(outerRadius, 0)
		.lt(outerRadius * 0.66, 0)

		.mt(0, outerRadius)
		.lt(0, outerRadius * 0.66)

		.mt(-outerRadius, 0)
		.lt(-(outerRadius * 0.66), 0);

	//outer circle surrounding 
	this.outerReticleFrame = new createjs.Shape();
	this.outerReticleFrame.graphics
		.ss(2)
		.s(Constants.BLUE)
		.dc(0, 0, outerRadius);

	this.container.addChild(this.outerReticle);
	this.container.addChild(this.outerReticleFrame);
	this.container.addChild(this.innerReticle);
};

TargetCursor.prototype.setStateMachine = function() {
	this.stateMachine = new StateMachine();

	this.stateMachine.addState(
		TargetCursorDefaultState.KEY,
		new TargetCursorDefaultState(this),
		[ TargetCursorContractState.KEY ]
	);

	this.stateMachine.addState(
		TargetCursorContractState.KEY, 	
		new TargetCursorContractState(this), 	
		[
			TargetCursorDefaultState.KEY,
			TargetCursorFocusState.KEY
		]
	);

	this.stateMachine.addState(
		TargetCursorFocusState.KEY, 	
		new TargetCursorFocusState(this), 	
		[ TargetCursorContractState.KEY ]
	);
	
	this.stateMachine.setState(TargetCursorDefaultState.KEY);
};