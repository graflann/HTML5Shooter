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

	this.stateMachine = null;

	this.numPiecesKilled = 0;

	this.piecesTotal = 0;

	this.init();
};

goog.inherits(EnemyCentipede, Enemy);

/**
*@override
*@public
*/
EnemyCentipede.prototype.init = function() {
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
*@override
*@public
*/
EnemyCentipede.prototype.kill = function() {
	if(this.isAlive) {
		this.setIsAlive(false);

		this.numPiecesKilled = 0;

		goog.events.dispatchEvent(this, this.enemyKilledEvent);
	}
};

/**
*@public
*/
EnemyCentipede.prototype.updateSeeking = function(options) {
	this.head.update(options);

	this.position.x = this.head.position.x;
	this.position.y = this.head.position.y;

	this.updateSegments(options);
};

/**
*@private
*/
EnemyCentipede.prototype.updateSegments = function(options) {
	var i = -1,
		length = this.arrSegments.length,
		segment,
		prevSegment,
		stage = app.layers.getStage(LayerTypes.MAIN);

	while(++i < length) {
		segment = this.arrSegments[i];

		if(i == 0)	prevSegment = this.head;
		else 		prevSegment = this.arrSegments[i - 1];

		segment.update({ 
			prevSegment: prevSegment 
		});
	}
};

/**
*@private
*/
EnemyCentipede.prototype.add = function() {
	var stage = app.layers.getStage(LayerTypes.MAIN),
		i = -1,
		index = 0;

	//add head
	stage.addChild(this.head.container);
	index = stage.getChildIndex(this.head.container);

	//add body segments
	while(++i < this.arrSegments.length) {
		stage.addChildAt(this.arrSegments[i].container, index);
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
	var i = -1,
		length = this.arrSegments.length,
		lastIndex = length - 1;

	this.head = new CentipedeHead();

	//listen to the head for its death
	goog.events.listen(
		this.head, 
		EventNames.ENEMY_KILLED, 
		this.onPieceKilled, 
		false, 
		this
	);

	//inc total to include head
	this.piecesTotal++;

	while(++i < this.arrSegments.length) {
		//Head velocity is based on the physics world so the segment needs to ingest it
		//and perform an internal translation to pixel velocity
		if(i == lastIndex)	this.arrSegments[i] = new CentipedeSegment(this.head.velocity, this.projectileSystem, true);
		else				this.arrSegments[i] = new CentipedeSegment(this.head.velocity, this.projectileSystem);
		
		//listen to each segment for its death
		goog.events.listen(
			this.arrSegments[i], 
			EventNames.ENEMY_KILLED, 
			this.onPieceKilled, 
			false, 
			this
		);

		//inc total to include segment
		this.piecesTotal++;
	}
};

/**
*@private
*/
EnemyCentipede.prototype.setPosition = function(pos) {
	var i = -1,
		scale = app.physicsScale;

	this.head.setPosition(pos);

	while(++i < this.arrSegments.length) {
		this.arrSegments[i].setPosition(pos.x * scale, pos.y * scale);
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

//EVENT HANDLERS
EnemyCentipede.prototype.onPieceKilled = function(e) {
	var piece = e.target; //either head or segment

	//unlisten the dead target piece
	// goog.events.unlisten(
	// 	piece, 
	// 	EventNames.ENEMY_KILLED, 
	// 	this.onPieceKilled, 
	// 	false, 
	// 	this
	// );

	if(++this.numPiecesKilled >= this.piecesTotal) {
		this.kill();
	}

	console.log("# of pieces killed: " + this.numPiecesKilled);
};

goog.exportSymbol('EnemyCentipede', EnemyCentipede);