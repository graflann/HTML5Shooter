goog.provide('EnemyCentipede');

goog.require('Enemy');
goog.require('CentipedeHead');
goog.require('CentipedeSegment');

/**
*@constructor
*/
EnemyCentipede = function(projectileSystem) {
	Enemy.call(this);

	/**
	 * @type {ProjectileSystem}
	 */
	this.projectileSystem = projectileSystem;

	this.head = null;

	this.arrSegments = new Array(8);

	this.arrSegmentTimeIndices = [
		15, 31, 47, 63, 79, 95, 111, 127
	];

	this.stateMachine = null;

	this.arrPrevPositions = [];
	this.frameCacheTotal = 128;
	this.frameCacheIndex = 0;
	this.isFrameCacheMaxed = false;

	this.init();
};

goog.inherits(EnemyCentipede, Enemy);

/**
*@override
*@public
*/
EnemyCentipede.prototype.init = function() {
	this.head = new CentipedeHead();

	this.setSegments();

	this.setStateMachine();

	this.setIsAlive(false);
};

/**
*@override
*@public
*/
EnemyCentipede.prototype.update = function(options) {
	if(this.isAlive) {
		var target = options.target,
			i = -1;

		//update current state
		//this.stateMachine.update(options);
		this.updateSeeking(options);
	}
};

/**
*@override
*@public
*/
EnemyCentipede.prototype.clear = function() {
	
};

/**
*@public
*/
EnemyCentipede.prototype.updateSeeking = function(options) {
	this.head.update(options);

	this.position.x = this.head.position.x;
	this.position.y = this.head.position.y;

	this.cachePrevPosition();

	this.updateSegments(options);
};

/**
*@private
*Cache the base shape's previous positions for a determined amount of frames / time
*/
EnemyCentipede.prototype.cachePrevPosition = function() {
	var prevPosition = this.arrPrevPositions[this.frameCacheIndex];

	prevPosition.x = this.position.x;
	prevPosition.y = this.position.y;

	//upon reaching the threshold, reset the index
	if(++this.frameCacheIndex >= this.frameCacheTotal) {
		this.frameCacheIndex = 0;

		//if all values of the cache have been initialized
		//all frame time indices can be implemented
		if(!this.isFrameCacheMaxed) {
			this.isFrameCacheMaxed = true;
		}
	}
};

/**
*@private
*/
EnemyCentipede.prototype.updateSegments = function(options) {
	var i = -1,
		length = this.arrSegments.length,
		segment,
		prevPosition;

	while(++i < length) {
		segment = this.arrSegments[i];

		//Grab per the time index or if prevPosition Array has yet to reach desired capacity,
		//grab using the highest possible index
		if(this.isFrameCacheMaxed) {
			prevPosition = this.arrPrevPositions[this.arrSegmentTimeIndices[i]];
		} else {
			prevPosition = this.arrPrevPositions[this.frameCacheIndex];
		}



		//segment.update(pos);

		//the previous position has been resolved so the position is set
		segment.setPosition(prevPosition.x, prevPosition.y);
	}
};

/**
*@private
*/
EnemyCentipede.prototype.add = function() {
	var stage = app.layers.getStage(LayerTypes.MAIN),
		i = -1;

	//add head
	stage.addChild(this.head.container);

	//add body segments
	while(++i < this.arrSegments.length) {
		stage.addChild(this.arrSegments[i].container);
	}
};

EnemyCentipede.prototype.setIsAlive = function(value) {
	var i = -1;

	this.isAlive = value;

	this.head.setIsAlive(value);

	while(++i < this.arrSegments.length) {
		this.arrSegments[i].setIsAlive(value);
	}
};

/**
*@private
*/
EnemyCentipede.prototype.setSegments = function() {
	var i = -1;

	while(++i < this.arrSegments.length) {
		this.arrSegments[i] = new CentipedeSegment(this.projectileSystem);
	}

	for(var i = 0; i < this.frameCacheTotal; i++) {
		this.arrPrevPositions[i] = new app.b2Vec2();
	}
};

/**
*@private
*/
EnemyCentipede.prototype.setPosition = function(pos) {
	var i = -1;

	this.head.setPosition(pos);

	while(++i < this.arrSegments.length) {
		this.arrSegments[i].setPosition(pos);
	}


};

EnemyCentipede.prototype.setPhysics = function() {
	var i = -1;

	this.head.setPhysics();

	while(++i < this.arrSegments.length) {
		this.arrSegments[i].setPhysics();
	}
};

EnemyCentipede.prototype.setStateMachine = function() {
	// this.stateMachine = new StateMachine();

	// this.stateMachine.addState(
	// 	EnemyCopterSeekingState.KEY,
	// 	new EnemyCopterSeekingState(this),
	// 	[ EnemyCopterFiringState.KEY ]
	// );
	
	// this.stateMachine.setState(State.KEY);
};

goog.exportSymbol('EnemyCentipede', EnemyCentipede);