goog.provide('Tower');

goog.require('SceneObject');
goog.require('BoundsUtils');

/**
*@constructor
*Multi segmented tower for depth perspective
*/
Tower = function(width, height, color, enemy) {
	SceneObject.call(this);

	/**
	*@type  {Number}
	*/
	this.width = width || Constants.UNIT;

	/**
	*@type  {Number}
	*/
	this.height = height || Constants.UNIT;
	
	/**
	*@type  {String}
	*/
	this.color = color || Constants.BLUE;

	this.enemy = enemy || null;
	
	/**
	*@type {Array.<Shape>}
	*/
	this.arrFloors = new Array(7);

	/**
	*@type {Array.<Number>}
	*/
	this.arrOffsets = new Array(this.arrFloors.length);

	this.offset = new app.b2Vec2(
		(this.width * 0.5 / app.physicsScale),
		(this.height * 0.5 / app.physicsScale)
	);
	
	this.init();
};

goog.inherits(Tower, SceneObject)

/**
*@override
*@public
*/
Tower.prototype.init = function() {
	var floor,
		foreground = app.layers.getStage(LayerTypes.FOREGROUND);

	this.shape = new createjs.Shape();
	this.shape.graphics.ss(1).s(this.color).f("#000").dr(0, 0, this.width, this.height);
    app.layers.getStage(LayerTypes.MAIN).addChild(this.shape);
	
	this.setPhysics();

	for(var i = 0; i < this.arrFloors.length; i++) {
		floor = new createjs.Shape();
		floor.graphics.ss(1).s(this.color).f("#000").dr(0, 0, this.width, this.height);
		foreground.addChild(floor);

		this.arrFloors[i] = floor;
		this.arrOffsets[i] = 0.025 + (i * 0.025);
	}

	if(this.enemy) {
		this.enemy.setPosition(this.position.x, this.position.y);
		this.enemy.setIsAlive(true);
		this.enemy.isWaveEnabled = false; //tower turret kills do not count towards wave completion
	}

	SceneObject.prototype.init.call(this);
};

/**
*@override
*@public
*/
Tower.prototype.update = function(options) {
	var camera = options.camera,
		floor,
		offset,
		x,
		y,
		i = -1,
		length = this.arrFloors.length;

	BoundsUtils.checkBounds(this.position, this.shape, options.camera);
	 
	while(++i < length) {
		floor = this.arrFloors[i];
		offset = this.arrOffsets[i];

		x = (camera.position.x + this.position.x - Constants.CENTER_X) * offset;
		y = (camera.position.y + this.position.y - Constants.CENTER_Y) * offset;

		floor.x = this.position.x + x;
		floor.y = this.position.y + y;

		floor.visible = this.shape.visible;
	}

	//update enemy on tower if present and alive
	if(this.enemy && this.enemy.isAlive) {
		this.enemy.setPosition(floor.x, floor.y);
	}
};

/**
*@override
*@public
*/
Tower.prototype.clear = function() {
	var i = 0;

	SceneObject.prototype.clear.call(this);

	this.enemy = null;
	
	for(i = 0; i < this.arrFloors.length; i++) {
		this.arrFloors[i].graphics.clear();
		this.arrFloors[i] = null;
	}
	this.arrFloors = null;

	for(i = 0; i < this.arrOffsets.length; i++) {
		this.arrOffsets[i] = null;
	}
	this.arrOffsets = null;

	this.offset = null;
};

/**
*@private
*/
Tower.prototype.setPosition = function(x, y) {	
	this.position.x = this.shape.x = x;
	this.position.y = this.shape.y = y;

	for(var i = 0; i < this.arrFloors.length; i++) {
		this.arrFloors[i].x = x;
		this.arrFloors[i].y = y;
	}
	
	this.body.SetPosition( 
		new app.b2Vec2(
			(x / app.physicsScale) + this.offset.x, 
			(y / app.physicsScale) + this.offset.y
		)
	);
};

/**
*@private
*/
Tower.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef(),
		w = this.width / (app.physicsScale * 2),
		h = this.height / (app.physicsScale * 2);
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 0;
	fixDef.filter.categoryBits = CollisionCategories.SCENE_OBJECT;
	fixDef.shape = new app.b2PolygonShape();
	fixDef.shape.SetAsBox(w, h);
	
	bodyDef.type = app.b2Body.b2_staticBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetAwake(false);
};