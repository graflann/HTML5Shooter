goog.provide('EnemyCentipede');

goog.require('Enemy');
goog.require('CentipedeHead');
goog.require('CentipedeSegment');
goog.require('EnemySeekingState');
goog.require('EnemyRetreatingState');

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

	this.tail = null;

	this.arrSegments = new Array(8);

	this.stateMachine = null;

	this.numPiecesKilled = 0;

	this.piecesTotal = 0;

	this.retreatTarget = new app.b2Vec2();

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

	this.scoreValue = 1600;
};

/**
*@override
*@public
*/
EnemyCentipede.prototype.update = function(options) {
	if(this.isAlive) {

		//update current state
		this.stateMachine.update(options);

		this.position.x = this.head.position.x;
		this.position.y = this.head.position.y;

		this.updateSegments(options);
	}
};

/**
*@public
*/
EnemyCentipede.prototype.enterSeeking = function(options) {
	
};

/**
*@public
*/
EnemyCentipede.prototype.updateSeeking = function(options) {
	var target = options.target;

	this.head.update({
		target: target.position,
		camera: options.camera
	});
};

/**
*@public
*/
EnemyCentipede.prototype.enterRetreating = function(options) {
	var deg = Math.randomInRange(0, 360),
		trigTable = app.trigTable;

	//Set retreat target to a random spot with a radius of screen dimensions
	this.retreatTarget.x = this.position.x + (trigTable.cos(deg) * Constants.WIDTH);
	this.retreatTarget.y = this.position.y + (trigTable.sin(deg) * Constants.HEIGHT);
};


/**
*@public
*/
EnemyCentipede.prototype.updateRetreating = function(options) {
	this.head.update({ 
		target: this.retreatTarget,
		camera: options.camera
	});

	//shots fire from the tail leg hooks
	if(this.tail) {
		this.tail.updateFire({ 
			target: options.target.position 
		});
	}

	//check out of retreat upon reaching the destination
	if(this.retreatTarget.DistanceSqrd(this.head.position) < 2) {
		this.stateMachine.setState(EnemySeekingState.KEY);
	}
};

/**
*@private
*/
EnemyCentipede.prototype.updateSegments = function(options) {
	var target = options.target,
		prevSegment,
		segment,
		stage = app.layers.getStage(LayerTypes.MAIN),
		i = -1,
		length = this.arrSegments.length;

	while(++i < length) {
		segment = this.arrSegments[i];

		if(i == 0)	prevSegment = this.head;
		else 		prevSegment = this.arrSegments[i - 1];

		segment.update({ 
			target: target.position,
			camera: options.camera,
			prevSegment: prevSegment 
		});
	}
};

/**
*@override
*@public
*/
EnemyCentipede.prototype.clear = function() {
	var i = 0;

	Enemy.prototype.clear.call(this);

	this.projectileSystem = null;

	//unlisten to head collision
	goog.events.unlisten(
		this.head, 
		EventNames.COLLISION, 
		this.onHeadCollision, 
		false, 
		this
	);

	goog.events.unlisten(
		this.head, 
		EventNames.ENEMY_KILLED, 
		this.onPieceKilled, 
		false, 
		this
	);

	this.head.clear();
	this.head = null;

	for(i = 0; i < this.arrSegments.length; i++) {
		goog.events.unlisten(
			this.arrSegments[i], 
			EventNames.ENEMY_KILLED, 
			this.onPieceKilled, 
			false, 
			this
		);

		this.arrSegments[i].clear();
		this.arrSegments[i] = null;
	}
	this.arrSegments = null;

	this.tail = null;

	this.stateMachine.clear();
	this.stateMachine = null;

	this.retreatTarget = null;
};

/**
*@override
*@public
*/
EnemyCentipede.prototype.kill = function() {
	if(this.isAlive) {
		this.setIsAlive(false);

		this.numPiecesKilled = 0;

		this.tail = this.arrSegments[this.arrSegments.length - 1];

		//EnemyCentipede handles this internally; 
		//other enemy instnace scoring handled during CollisionManager killList processing
		app.scoreManager.updateScore(this.getScoreValue());

		this.dispatchKillEvent();
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

	//add body segments, each beneath the previous
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

	if(this.isAlive) {
		i = -1;

		this.head.health = 24;
		while(++i < this.arrSegments.length) {
			this.arrSegments[i].health = 8;
		}
	}
};

/**
*@private
*/
EnemyCentipede.prototype.setSegments = function() {
	var i = -1,
		length = this.arrSegments.length,
		lastIndex = length - 1;

	this.head = new CentipedeHead(this.projectileSystem);

	//listen to head for collision with player
	goog.events.listen(
		this.head, 
		EventNames.COLLISION, 
		this.onHeadCollision, 
		false, 
		this
	);

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
		if(i == lastIndex)	{
			this.arrSegments[i] = new CentipedeSegment(this.head.velocity, this.projectileSystem, true);
			this.tail = this.arrSegments[i]; //maintain a ref to the tail segment
		} else {
			this.arrSegments[i] = new CentipedeSegment(this.head.velocity, this.projectileSystem);
		}
		
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
	this.stateMachine = new StateMachine();

	this.stateMachine.addState(
		EnemySeekingState.KEY,
		new EnemySeekingState(this),
		[ EnemyRetreatingState.KEY ]
	);

	this.stateMachine.addState(
		EnemyRetreatingState.KEY,
		new EnemyRetreatingState(this),
		[ EnemySeekingState.KEY ]
	);
	
	this.stateMachine.setState(EnemySeekingState.KEY);
};

//EVENT HANDLERS
EnemyCentipede.prototype.onHeadCollision = function(e) {
	if(this.stateMachine.currentKey === EnemySeekingState.KEY) {
		this.stateMachine.setState(EnemyRetreatingState.KEY);
	} else {
		this.stateMachine.setState(EnemySeekingState.KEY);
	}
};

EnemyCentipede.prototype.onPieceKilled = function(e) {
	if(e.target == this.tail) {
		this.tail = null;
	}

	if(++this.numPiecesKilled >= this.piecesTotal) {
		this.kill();
	}

	console.log("# of centipede pieces killed: " + this.numPiecesKilled);
};

goog.exportSymbol('EnemyCentipede', EnemyCentipede);