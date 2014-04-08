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
goog.require('ItemSystem');
goog.require('ItemTypes');
goog.require('EventNames');
goog.require('LevelProxy');
goog.require('EnterLevelOverlay');
goog.require('GameOverOverlay');
goog.require('WarningOverlay');
goog.require('StateMachine');
goog.require('PanelIntroState');
goog.require('PanelDefaultState');
goog.require('PanelGameOverState');

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
	*@type {Array}
	*/
	this.arrItemSystems = [];
	
	this.collisionManager = null;

	this.camera = null;

	this.levelProxy = null;

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

	this.overlay = null;

	this.stateMachine = null;

	this.load();
};

goog.inherits(PlayPanel, Panel);

PlayPanel.TIME_STEP = 1 / 60;

/**
*@override
*@protected
*/
PlayPanel.prototype.load = function() {
	this.levelProxy = new LevelProxy();

	goog.events.listen(
		this.levelProxy, 
		EventNames.LOAD_COMPLETE, 
		this.onLevelLoadComplete, 
		false, 
		this
	);

	this.levelProxy.load();
};

/**
*@override
*@protected
*/
PlayPanel.prototype.init = function() {
	this.setLayers();
	this.setPhysics();
	this.setParticles();
	this.setProjectiles();
	this.setItems();
	this.setPlayer();
	this.setLevel();
	this.setCollisionManager();
	this.setCamera();
	this.setStateMachine();
	this.setEventListeners();
};

/**
*@override
*@protected
*/
PlayPanel.prototype.update = function() {
	var options = {
			player: 			this.player,
			target: 			this.player,
			arrEnemySystems: 	this.level.arrEnemySystems,
			camera: 			this.camera,
			hto: 				this.hto,
			homingList: 		this.collisionManager.homingList
		};

	this.stateMachine.update(options);

	this.updateLayers();
};

PlayPanel.prototype.enterIntro = function(options) {
	var self = this,
    	stage = app.layers.getStage(LayerTypes.HUD);

	this.overlay = new EnterLevelOverlay(this);
	stage.addChild(this.overlay.container);

	//app.assetsProxy.playSound('Glide', 1, true);

	//some delays set to let the overlay animate correctly
	setTimeout(function() {
		self.overlay.animate();

		setTimeout(function() {
			createjs.Tween.get(self.overlay.container).to({ alpha: 0 }, 1000)
				.call(function() {
					stage.removeChild(self.overlay.container);
					
					self.overlay.clear();
					self.overlay = null;
				});

			createjs.Tween.get(self.hud.container).to({ alpha: 1 }, 1000);

			self.stateMachine.setState(PanelDefaultState.KEY);
		}, 4500);
	}, 500);
};

PlayPanel.prototype.updateIntro = function(options) {
	this.camera.update();
};

PlayPanel.prototype.exitIntro = function(options) {};


PlayPanel.prototype.enterDefault = function(options) {
	this.level.startWaves();
};

PlayPanel.prototype.updateDefault = function(options) {
	var input = app.input;

	this.updatePlayer(options);
	this.updateLevel(options);
	this.updateParticles(options);
	this.updateItems();
	this.updatePhysics(options);
	this.camera.update();
	this.updateHud(options);

	//toggles debug draw mode
	if(input.isKeyPressedOnce(KeyCode.F2)) {
		app.physicsDebug = !app.physicsDebug;

		this.setDebug();
	}

	input.checkPrevKeyDown([
		KeyCode.F2
	]);
};

PlayPanel.prototype.exitDefault = function(options) {

};


PlayPanel.prototype.enterGameOver = function(options) {
	var self = this;

	this.hto.remove();
	this.level.removeReticles();

	this.overlay = new GameOverOverlay(this);
	app.layers.getStage(LayerTypes.HUD).addChild(this.overlay.container);

	this.overlay.animate(function() { self.level.kill(); });

	createjs.Sound.stop();
	app.assetsProxy.playSound('intro1');
};

PlayPanel.prototype.updateGameOver = function(options) {
	var input = app.input;

	//this.camera.update();
	this.updateParticles(options);

	this.overlay.update(options);

	input.checkPrevButtonDown([
		GamepadCode.BUTTONS.DPAD_UP,
		GamepadCode.BUTTONS.DPAD_DOWN,
		GamepadCode.BUTTONS.DPAD_LEFT,
		GamepadCode.BUTTONS.DPAD_RIGHT,
		GamepadCode.BUTTONS.START,
		GamepadCode.BUTTONS.A
	]);
};

PlayPanel.prototype.exitGameOver = function(options) {};

/**
*@override
*@protected
*/
PlayPanel.prototype.clear = function() {
	var i = 0,
		key;

	Panel.prototype.clear.call(this);

	this.removeEventListeners();

	app.scoreManager.reset();

	this.background.graphics.clear();
	this.background = null;
	
	for(key in this.arrPlayerProjectileSystems) {

		if(this.arrPlayerProjectileSystems[key] instanceof ProjectileSystem) {
			this.arrPlayerProjectileSystems[key].clear();
			this.arrPlayerProjectileSystems[key] = null;
		} else {
			for(i = 0; i < this.arrPlayerProjectileSystems[key].length; i++) {
				this.arrPlayerProjectileSystems[key][i].clear();
				this.arrPlayerProjectileSystems[key][i] = null;
			}

			this.arrPlayerProjectileSystems[key] = null;
		}
		
	}
	this.arrPlayerProjectileSystems= null;

	this.player.clear();
	this.player = null;
	
	this.playerProjectileSystem = null;

	for(key in this.arrParticleSystems) {
		this.arrParticleSystems[key].clear();
		this.arrParticleSystems[key] = null;
	}
	this.arrParticleSystems = null;

	for(key in this.arrItemSystems) {
		this.arrItemSystems[key].clear();
		this.arrItemSystems[key] = null;
	}
	this.arrItemSystems = [];
	
	this.collisionManager.clear();
	this.collisionManager = null;

	this.camera.clear();
	this.camera = null;

	this.levelProxy.clear();
	this.levelProxy = null;

	this.level.clear();
	this.level = null;

	this.grid.clear();
	this.grid = null;

	this.hud.clear();
	this.hud = null;

	this.hto.clear();
	this.hto = null;

	if(this.overlay) {
		this.overlay.clear();
		this.overlay = null;
	}

	app.physicsWorld.ClearForces();
	//app.physicsWorld = null;
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
	this.player.currentProjectileSystem.update(options);

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
PlayPanel.prototype.updateParticles = function(options) {
	for(var key in this.arrParticleSystems) {
		this.arrParticleSystems[key].update(options);
	}
};

/**
*@private
*/
PlayPanel.prototype.updateItems = function() {
	for(var key in this.arrItemSystems) {
		this.arrItemSystems[key].update();
	}
};

/**
*@private
*/
PlayPanel.prototype.updatePhysics = function(options) {
	//BOX2D STEP////////////////////////////////
	app.physicsWorld.Step(PlayPanel.TIME_STEP, 10, 10);
	
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
	
	this.grid.update();
};

PlayPanel.prototype.setLayers = function() {
	//sets BACKGROUND depth to z-index of -1, beneath MAIN
	app.layers.add(LayerTypes.BACKGROUND, -1);

	app.layers.add(LayerTypes.FOREGROUND);
	app.layers.add(LayerTypes.SHADOW);
	app.layers.add(LayerTypes.PROJECTILE);
	app.layers.add(LayerTypes.AIR);
	app.layers.add(LayerTypes.HOMING);
	app.layers.add(LayerTypes.HUD);
	app.layers.addDebug();

	this.background = new createjs.Shape();
	this.background.graphics
		.lf([Constants.DARK_BLUE, Constants.BLACK], [0, 0.75], 0, 0, 0, Constants.HEIGHT)
		.dr(0, 0, Constants.WIDTH, Constants.HEIGHT);

	app.layers.getStage(LayerTypes.BACKGROUND).addChild(this.background);

	app.arenaWidth = Constants.WIDTH * 4;
	app.arenaHeight = Constants.HEIGHT * 2;
	
	this.grid = new Grid(
		app.arenaWidth, 
		app.arenaHeight, 
		Constants.UNIT, 
		Constants.WHITE
	);
	app.layers.getStage(LayerTypes.MAIN).addChild(this.grid.shape);

	this.hud = new Hud();
	app.layers.getStage(LayerTypes.HUD).addChild(this.hud.container);
	this.hud.container.alpha = 0;
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
		
	// if(app.physicsWorld == null || app.physicsWorld == undefined) {
	// 	app.physicsWorld = new app.b2World(new app.b2Vec2(), false);
	// }

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

	//TURRET
	this.arrPlayerProjectileSystems[ProjectileTypes.VULCAN] = [
		new ProjectileSystem(ProjectileTypes.VULCAN, [Constants.LIGHT_BLUE, Constants.DARK_BLUE]),
		new ProjectileSystem(
			ProjectileTypes.GRENADE, 
			[Constants.YELLOW, Constants.RED],
			32,
			CollisionCategories.PLAYER_PROJECTILE,
			CollisionCategories.GROUND_ENEMY | CollisionCategories.SCENE_OBJECT
		)
	];

	this.arrPlayerProjectileSystems[ProjectileTypes.SPREAD] = [
		new ProjectileSystem(ProjectileTypes.SPREAD, [Constants.LIGHT_BLUE, Constants.DARK_BLUE], 30),
		new ProjectileSystem(ProjectileTypes.REFLECT, [Constants.YELLOW, Constants.DARK_BLUE], 32)
	];

	this.arrPlayerProjectileSystems[ProjectileTypes.BLADE] = [
		new ProjectileSystem(ProjectileTypes.BLADE, [Constants.LIGHT_BLUE, Constants.DARK_BLUE], 32),
		new ProjectileSystem(ProjectileTypes.ROTARY_SAW, [Constants.YELLOW, Constants.RED], 128)
	];

	this.arrPlayerProjectileSystems[ProjectileTypes.SNIPER] = [
		new ProjectileSystem(ProjectileTypes.SNIPER, [Constants.LIGHT_BLUE, Constants.DARK_BLUE], 2),
		new ProjectileSystem(ProjectileTypes.LASER, [Constants.YELLOW, Constants.RED], 32)
	];

	//HOMING 
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

	this.arrParticleSystems[ParticleSystemNames.PLAYER_EXPLOSION] = new ParticleSystem(
		ParticleTypes.EXPLOSION,
		Constants.BLUE,
		32
	);

	this.arrParticleSystems[ParticleSystemNames.PLAYER_RETICLE] = new ParticleSystem(
		ParticleTypes.RETICLE,
		Constants.LIGHT_BLUE,
		4
	);

	this.arrParticleSystems[ParticleSystemNames.GRENADE] = new ParticleSystem(
		ParticleTypes.GRENADE,
		Constants.RED,
		32
	);

	this.arrParticleSystems[ParticleSystemNames.OVERDRIVE_PICK_UP] = new ParticleSystem(
		ParticleTypes.PICK_UP,
		Constants.ORANGE,
		4
	);

	this.arrParticleSystems[ParticleSystemNames.BOOST] = new ParticleSystem(
		ParticleTypes.BOOST,
		null,
		1
	);

	this.arrParticleSystems[ParticleSystemNames.SPAWN_GENERATOR] = new ParticleSystem(
		ParticleTypes.SPAWN_GENERATOR,
		null,
		4
	);
};

/**
*@private
*/
PlayPanel.prototype.setItems = function() {
	var itemType;

	for(var key in ItemTypes) {
		itemType = ItemTypes[key];

		this.arrItemSystems[itemType] = new ItemSystem(
			itemType,
			16
		);
	}

	// this.arrItemSystems[ItemTypes.ENERGY] = new ItemSystem(
	// 	ItemTypes.ENERGY,
	// 	16
	// );
};

/**
*@private
*/
PlayPanel.prototype.setPlayer = function() {
	this.player = new PlayerTank(
		this.arrPlayerProjectileSystems,
		this.arrParticleSystems[ParticleSystemNames.BOOST]
	);
	
	this.player.setPosition(
		new app.b2Vec2(
			((app.arenaWidth * 0.5) - (this.player.width * 0.5) + 10) / app.physicsScale,
			((app.arenaHeight * 0.5) - (this.player.height * 0.5)) / app.physicsScale
		)
	);
	app.layers.getStage(LayerTypes.MAIN).addChild(this.player.container);

	//Player uses this to acquire homing targets
	this.hto = new HomingTargetingOverlay();	
};

PlayPanel.prototype.setLevel = function() {
	this.level = new Level(this.levelProxy.currentLevelData);

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
		this.arrPlayerProjectileSystems,
		this.arrItemSystems
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
			app.layers.getStage(LayerTypes.FOREGROUND),
			app.layers.getStage(LayerTypes.SHADOW),
			app.layers.getStage(LayerTypes.PROJECTILE),
			app.layers.getStage(LayerTypes.AIR),
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

PlayPanel.prototype.setStateMachine = function() {
	this.stateMachine = new StateMachine();

	this.stateMachine.addState(
		PanelIntroState.KEY,
		new PanelIntroState(this),
		[ PanelDefaultState.KEY ]
	);

	this.stateMachine.addState(
		PanelDefaultState.KEY,
		new PanelDefaultState(this),
		[ PanelGameOverState.KEY ]
	);

	this.stateMachine.addState(
		PanelGameOverState.KEY,
		new PanelGameOverState(this),
		[]
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
		EventNames.INCREASE_HOMING_OVERLAY, 
		this.onIncreaseHomingOverlay, 
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

	goog.events.listen(
		this.player, 
		EventNames.ENERGY_CHANGE, 
		this.onEnergyChange, 
		false, 
		this
	);

	goog.events.listen(
		this.player, 
		EventNames.OVERDRIVE_CHANGE, 
		this.onOverdriveChange, 
		false, 
		this
	);

	goog.events.listen(
		this.player, 
		EventNames.GAME_OVER, 
		this.onGameOver, 
		false, 
		this
	);

	//SCORE MANAGER
	goog.events.listen(
		app.scoreManager, 
		EventNames.UPDATE_SCORE, 
		this.onUpdateScore, 
		false, 
		this
	);

	goog.events.listen(
		app.scoreManager, 
		EventNames.UPDATE_BONUS, 
		this.onUpdateBonus,
		false, 
		this
	);

	//LEVEL
	goog.events.listen(
		this.level, 
		EventNames.INIT_WARNING, 
		this.onInitWarning,
		false, 
		this
	);

	goog.events.listen(
		this.level, 
		EventNames.FORCED_KILL, 
		this.onForcedKill,
		false, 
		this
	);
	/////////////////////////////////////
};

PlayPanel.prototype.removeEventListeners = function() {
	goog.events.unlisten(
		this.player, 
		EventNames.WEAPON_SELECT, 
		this.onWeaponSelect, 
		false, 
		this
	);

	goog.events.unlisten(
		this.player, 
		EventNames.ADD_HOMING_OVERLAY, 
		this.onAddHomingOverlay, 
		false, 
		this
	);

	goog.events.unlisten(
		this.player, 
		EventNames.INCREASE_HOMING_OVERLAY, 
		this.onIncreaseHomingOverlay, 
		false, 
		this
	);

	goog.events.unlisten(
		this.player, 
		EventNames.REMOVE_HOMING_OVERLAY, 
		this.onRemoveHomingOverlay, 
		false, 
		this
	);

	goog.events.unlisten(
		this.player, 
		EventNames.ENERGY_CHANGE, 
		this.onEnergyChange, 
		false, 
		this
	);

	goog.events.unlisten(
		this.player, 
		EventNames.OVERDRIVE_CHANGE, 
		this.onOverdriveChange, 
		false, 
		this
	);

	//SCORE MANAGER
	goog.events.unlisten(
		app.scoreManager, 
		EventNames.UPDATE_SCORE, 
		this.onUpdateScore, 
		false, 
		this
	);

	goog.events.unlisten(
		app.scoreManager, 
		EventNames.UPDATE_BONUS, 
		this.onUpdateBonus,
		false, 
		this
	);

	//LEVEL
	goog.events.unlisten(
		this.level, 
		EventNames.INIT_WARNING, 
		this.onInitWarning,
		false, 
		this
	);

	goog.events.unlisten(
		this.level, 
		EventNames.FORCED_KILL, 
		this.onForcedKill,
		false, 
		this
	);
};

//EVENT HANDLERS////////////////////////////////////////////////////
/**
*@private
*@param {goog.events.Event} e
**/
PlayPanel.prototype.onLevelLoadComplete = function(e) {
    goog.events.unlisten(
    	this.levelProxy, 
    	EventNames.LOAD_COMPLETE, 
    	this.onLevelLoadComplete, 
    	false, 
    	this
    );

    goog.events.listen(
    	app.assetsProxy, 
    	EventNames.LOAD_COMPLETE, 
    	this.onAssetsLoadComplete, 
    	false, 
    	this
    );

   	app.assetsProxy.load(
   		this.levelProxy.getImageNames(), 
   		this.levelProxy.getSoundNames()
   	);
};

/**
*@private
*@param {goog.events.Event} e
**/
PlayPanel.prototype.onAssetsLoadComplete = function(e) {
	var self,
		stage;

    goog.events.unlisten(
    	app.assetsProxy, 
    	EventNames.LOAD_COMPLETE, 
    	this.onAssetsLoadComplete, 
    	false, 
    	this
    );

    this.init();

	this.isInited = true;

    //once loaded and inited notify the game to remove the loading screen
    goog.events.dispatchEvent(this, new goog.events.Event(EventNames.PANEL_LOAD_COMPLETE, this));

    this.stateMachine.setState(PanelIntroState.KEY);
};

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
PlayPanel.prototype.onIncreaseHomingOverlay = function(e) {
	this.hto.increase(e.payload);
};

/**
*@private
*/
PlayPanel.prototype.onRemoveHomingOverlay = function(e) {
	this.hto.remove();
	this.level.removeReticles();
};

/**
*@private
*/
PlayPanel.prototype.onEnergyChange = function(e) {
	this.hud.changeEnergy(e.payload);
};

/**
*@private
*/
PlayPanel.prototype.onOverdriveChange = function(e) {
	this.hud.changeOverdrive(e.payload);
};

/**
*@private
*/
PlayPanel.prototype.onGameOver = function(e) {	
	this.stateMachine.setState(PanelGameOverState.KEY);
};

/**
*@private
*/
PlayPanel.prototype.onUpdateScore = function(e) {
	this.hud.updateScore(e.payload);
};

/**
*@private
*/
PlayPanel.prototype.onUpdateBonus = function(e) {
	this.hud.updateBonus(e.payload);
};

/**
*@private
*/
PlayPanel.prototype.onInitWarning = function(e) {
	var stage = app.layers.getStage(LayerTypes.HUD);

	this.overlay = new WarningOverlay(this);
	stage.addChild(this.overlay.container);

	goog.events.listen(
		this.overlay, 
		EventNames.END_WARNING, 
		this.onEndWarning,
		false, 
		this
	);

	this.overlay.animate();
};

/**
*@private
*/
PlayPanel.prototype.onEndWarning = function(e) {
	var stage = app.layers.getStage(LayerTypes.HUD);

	goog.events.unlisten(
		this.overlay, 
		EventNames.END_WARNING, 
		this.onEndWarning,
		false, 
		this
	);

	stage.removeChild(this.overlay.container);
	this.overlay.clear();
	this.overlay = null;
};

/**
*Handles a notification to force a GameObject onto the kill list
*/
PlayPanel.prototype.onForcedKill = function(e) {
	//the event payload is the enemy requesting to be killed
	this.collisionManager.killList.push(e.payload);
};