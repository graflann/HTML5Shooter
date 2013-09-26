goog.provide('PlayPanel');

goog.require('Panel');
goog.require('Layer');
goog.require('LayerTypes');
goog.require('KeyCode');
goog.require('GamepadCode');
goog.require('Camera');
goog.require('CollisionManager');
goog.require('GameObject');
goog.require('Turret');
goog.require('Constants');
goog.require('Grid');
goog.require('Hud');
goog.require('HomingTargetingOverlay');
goog.require('Level');
goog.require('PlayerTank');
goog.require('EnemySystem');
goog.require('EnemyTypes');
goog.require('ProjectileSystem');
goog.require('ProjectileTypes');
goog.require('ParticleSystem');
goog.require('ParticleTypes');
goog.require('ParticleSystemNames');
goog.require('EventNames');

/**
*@constructor
*Where the primary play activity takes place
*/
PlayPanel = function() {
	Panel.call(this);
	
	/**
	*@type {Shape}
	*/
	this.background;

	/**
	*@type {PlayerTank}
	*/
	this.player = null;
	
	/**
	*@type {Array}
	*/
	this.arrPlayerProjectileSystems = [];

	/**
	*@type {ProjectileSystem}
	*/
	this.playerProjectileSystem = null;

	/**
	*@type {Array}
	*/
	this.arrParticleSystems = [];
	
	/**
	*@type {Box2D.Dynamics.b2World}
	*/
	this.timeStep = 1 / 60;
	
	this.collisionManager = null;

	this.camera = null;

	this.level = null;

	/**
	*@type {Grid}
	*/
	this.grid = null;

	this.hud = null

	/**
	*@type {HomingTargetingOverlay}
	*/
	this.hto = null;

	this.init();
};

goog.inherits(PlayPanel, Panel);

/**
*@override
*@protected
*/
PlayPanel.prototype.init = function() {
	this.setLayers();
	this.setPhysics();
	this.setProjectiles();
	this.setParticles();
	this.setPlayer();
	this.setLevel();
	this.setCollisionManager();
	this.setCamera();
	this.setEventListeners();
};

/**
*@override
*@protected
*/
PlayPanel.prototype.update = function() {
	var input = app.input,
		options = {
			player: 			this.player,
			target: 			this.player,
			arrEnemySystems: 	this.level.arrEnemySystems,
			camera: 			this.camera,
			hto: 				this.hto,
			homingList: 		this.collisionManager.homingList
		};

	this.updatePlayer(options);
	this.updateLevel(options);
	this.updateParticles(options);
	this.updatePhysics(options);
	this.camera.update();
	this.updateHud(options);
	this.updateLayers();

	//toggles debug draw mode
	if(input.isKeyPressedOnce(KeyCode.F2)) {
		app.physicsDebug = !app.physicsDebug;

		this.setDebug();
	}

	input.checkPrevKeyDown([
		KeyCode.F2
	]);
};

/**
*@override
*@protected
*/
PlayPanel.prototype.clear = function() {
	var i = this.arrEnemies.length;
	
	//TODO: Clear out layers
	// app.layers.getStage(LayerTypes.MAIN).removeChild(this.background);
	// this.background = null;
	
	// app.layers.getStage(LayerTypes.MAIN).removeChild(this.grid);
	// this.grid = null;
	
	// while(i--) {
	// 	app.layers.getStage(LayerTypes.MAIN).removeChild(this.arrEnemies[i].shape);
	// 	this.arrEnemies[i].clear();
	// 	this.arrEnemies[i] = null;
	// }

	this.arrEnemies = null;
};

/**
*@private
*/
PlayPanel.prototype.setDebug = function() {
	app.layers.setDebug(app.physicsDebug);
};

/**
*@private
*/
PlayPanel.prototype.updatePlayer = function(options) {
	this.player.update(options);
	this.player.currentProjectileSystem.update();

	this.player.homingProjectileSystem.update(options);

	this.hto.update(options);
};

/**
*@private
*/
PlayPanel.prototype.updateLevel = function(options) {
	this.level.update(options);
};

/**
*@private
*/
PlayPanel.prototype.updateParticles = function() {
	for(var key in this.arrParticleSystems) {
		this.arrParticleSystems[key].update();
	}
};

/**
*@private
*/
PlayPanel.prototype.updatePhysics = function(options) {
	//BOX2D STEP////////////////////////////////
	app.physicsWorld.Step(this.timeStep, 10, 10);
	
	if (app.physicsDebug) {
		app.physicsWorld.DrawDebugData();
	}
		
	app.physicsWorld.ClearForces();
	////////////////////////////////////////////

	this.collisionManager.update(options);
};

/**
*@private
*/
PlayPanel.prototype.updateHud = function(options) {
	this.hud.update(options);
};

/**
*@private
*/
PlayPanel.prototype.updateLayers = function() {
	Panel.prototype.update.call(this);
};

PlayPanel.prototype.setLayers = function() {
	app.layers.add(LayerTypes.BACKGROUND);
	app.layers.add(LayerTypes.PROJECTILE);
	app.layers.add(LayerTypes.FOREGROUND);
	app.layers.add(LayerTypes.HOMING);
	app.layers.add(LayerTypes.HUD);
	app.layers.addDebug();

	//set BACKGROUND to z-index of 0 as MAIN has it by default
	app.layers.swapLayers(LayerTypes.BACKGROUND, LayerTypes.MAIN);

	this.background = new createjs.Shape();
	this.background.graphics
		.lf([Constants.DARK_BLUE, Constants.BLACK], [0, 1], 0, Constants.WIDTH, 0, Constants.HEIGHT)
		.dr(0, 0, Constants.WIDTH, Constants.HEIGHT);

	app.layers.getStage(LayerTypes.BACKGROUND).addChild(this.background);
	
	this.grid = new Grid(
		Constants.WIDTH * 4, 
		Constants.HEIGHT * 2, 
		Constants.UNIT, 
		Constants.WHITE
	);
	app.layers.getStage(LayerTypes.MAIN).addChild(this.grid.shape);

	this.hud = new Hud();
	app.layers.getStage(LayerTypes.HUD).addChild(this.hud.container);
};

/**
*Sets the Box2D world or "arena" for play with physical bounds (4) enclosing it
*@private
*/
PlayPanel.prototype.setPhysics = function() {
	var debugDraw 	= new app.b2DebugDraw(),
		fixDef 		= new app.b2FixtureDef(),
		bodyDef 	= new app.b2BodyDef(),
		w 			= Constants.WIDTH / app.physicsScale,
		h 			= Constants.HEIGHT / app.physicsScale,
		thickness 	= 0.0625;
	
	fixDef.density = 1;
	fixDef.friction = 0;
	fixDef.restitution = 1;
		
	if(app.physicsWorld == null || app.physicsWorld == undefined) {
		app.physicsWorld = new app.b2World(new app.b2Vec2(), false);
	}

	/*
	//creates static, rigid body borders to enclose the action within the field of play
	bodyDef.type = app.b2Body.b2_staticBody;
	fixDef.shape = new app.b2PolygonShape();
	fixDef.shape.SetAsBox(w, thickness);
	
	//left
	bodyDef.position.Set(0, 0);
	app.physicsWorld.CreateBody(bodyDef).CreateFixture(fixDef);
	
	//right
	bodyDef.position.Set(0, h);
	app.physicsWorld.CreateBody(bodyDef).CreateFixture(fixDef);
	
	//top
	fixDef.shape.SetAsBox(thickness, h);
	bodyDef.position.Set(0, 0);
	app.physicsWorld.CreateBody(bodyDef).CreateFixture(fixDef);
	
	//bottom
	bodyDef.position.Set(w, 0);
	app.physicsWorld.CreateBody(bodyDef).CreateFixture(fixDef);
	*/
	
	//draws the physics bodies when in debug mode (physicsDebug = true @ main.js)
	debugDraw.SetSprite(app.layers.getDebugContext());
	debugDraw.SetDrawScale(app.physicsScale);
	debugDraw.SetFillAlpha(0.75);
	debugDraw.SetLineThickness(3.0);
	debugDraw.SetFlags(app.b2DebugDraw.e_shapeBit);
	app.physicsWorld.SetDebugDraw(debugDraw);
};

/**
*@private
*/
PlayPanel.prototype.setProjectiles = function() {
	//PLAYER PROJECTILES///////////////////////////////////////////////////////////
	this.arrPlayerProjectileSystems[ProjectileTypes.VULCAN] = new ProjectileSystem(
		ProjectileTypes.VULCAN, 
		[Constants.LIGHT_BLUE, Constants.DARK_BLUE]
	);

	this.arrPlayerProjectileSystems[ProjectileTypes.SPREAD] = new ProjectileSystem(
		ProjectileTypes.SPREAD, 
		[Constants.LIGHT_BLUE, Constants.DARK_BLUE],
		30
	);

	this.arrPlayerProjectileSystems[ProjectileTypes.BLADE] = new ProjectileSystem(
		ProjectileTypes.BLADE, 
		[Constants.LIGHT_BLUE, Constants.DARK_BLUE],
		16
	);

	this.arrPlayerProjectileSystems[ProjectileTypes.SNIPER] = new ProjectileSystem(
		ProjectileTypes.SNIPER, 
		[Constants.LIGHT_BLUE, Constants.DARK_BLUE],
		2
	);

	this.arrPlayerProjectileSystems[ProjectileTypes.HOMING] = new ProjectileSystem(
		ProjectileTypes.HOMING, 
		[Constants.LIGHT_BLUE, Constants.DARK_BLUE],
		4,
		CollisionCategories.HOMING_PROJECTILE,
		CollisionCategories.AIR_ENEMY
	);
	///////////////////////////////////////////////////////////////////////////////
};

/**
*@private
*/
PlayPanel.prototype.setParticles = function() {
	this.arrParticleSystems[ParticleSystemNames.POSITIVE_HIT] = new ParticleSystem(
		ParticleTypes.HIT,
		Constants.YELLOW,
		32
	);

	this.arrParticleSystems[ParticleSystemNames.NEUTRAL_HIT] = new ParticleSystem(
		ParticleTypes.HIT,
		Constants.LIGHT_BLUE,
		32
	);

	this.arrParticleSystems[ParticleSystemNames.ENEMY_EXPLOSION] = new ParticleSystem(
		ParticleTypes.EXPLOSION,
		Constants.YELLOW,
		64
	);

	this.arrParticleSystems[ParticleSystemNames.PLAYER_RETICLE] = new ParticleSystem(
		ParticleTypes.RETICLE,
		Constants.LIGHT_BLUE,
		4
	);
};

/**
*@private
*/
PlayPanel.prototype.setPlayer = function() {
	this.player = new PlayerTank(this.arrPlayerProjectileSystems);
	
	this.player.setPosition(
		new app.b2Vec2(
			((Constants.WIDTH * 0.25) - (this.player.width * 0.5)) / app.physicsScale,
			((Constants.HEIGHT * 0.5) - (this.player.height * 0.5)) / app.physicsScale
		)
	);
	app.layers.getStage(LayerTypes.MAIN).addChild(this.player.container);

	//Player uses this to acquire homing targets
	this.hto = new HomingTargetingOverlay();	
};

PlayPanel.prototype.setLevel = function() {
	this.level = new Level();

	this.hud.setRadar(
		this.grid.width, 
		this.grid.height,
		this.player,
		this.level.arrEnemySystems
	);
};

PlayPanel.prototype.setCollisionManager = function() {
	//contact listener processes collision
	this.collisionManager = new CollisionManager(
		this.arrParticleSystems,
		this.arrPlayerProjectileSystems
	);
};

/**
*@private
*/
PlayPanel.prototype.setCamera = function() {
	this.camera = new Camera(
		this.player.container, 
		[
			app.layers.getStage(LayerTypes.MAIN),
			app.layers.getStage(LayerTypes.PROJECTILE),
			app.layers.getStage(LayerTypes.FOREGROUND),
			app.layers.getStage(LayerTypes.HOMING)
		],
		app.layers.getDebugContext(),
		new app.b2Vec2(
			(Constants.WIDTH * 0.5) - (this.player.width * 0.5), 
			(Constants.HEIGHT * 0.5) - (this.player.height * 0.5)
		),
		new app.b2Vec2(-(Constants.WIDTH * 3), - Constants.HEIGHT),
		new app.b2Vec2()
	);
};

PlayPanel.prototype.setEventListeners = function() {
	//PLAYER/////////////////////////////////////
	goog.events.listen(
		this.player, 
		EventNames.WEAPON_SELECT, 
		this.onWeaponSelect, 
		false, 
		this
	);

	goog.events.listen(
		this.player, 
		EventNames.ADD_HOMING_OVERLAY, 
		this.onAddHomingOverlay, 
		false, 
		this
	);

	goog.events.listen(
		this.player, 
		EventNames.REMOVE_HOMING_OVERLAY, 
		this.onRemoveHomingOverlay, 
		false, 
		this
	);
	/////////////////////////////////////
};

//EVENT HANDLERS////////////////////////////////////////////////////
/**
*@private
*/
PlayPanel.prototype.onWeaponSelect = function(e) {
	this.hud.setSelection(e.target.currentWeaponIndex);
};

/**
*@private
*/
PlayPanel.prototype.onAddHomingOverlay = function(e) {
	this.arrParticleSystems[ParticleSystemNames.PLAYER_RETICLE].kill();
	this.collisionManager.resetHomingList();
	this.hto.add();
};

/**
*@private
*/
PlayPanel.prototype.onRemoveHomingOverlay = function(e) {
	this.hto.remove();
	this.level.removeReticles();
};