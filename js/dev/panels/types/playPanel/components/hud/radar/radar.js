goog.provide('Radar');

goog.require('Marker');

/**
*@constructor
*Radar component
*/
Radar = function() {	
	this.container = null;

	this.fieldContainer = null;

	this.background = null;

	this.mask = null;

	this.width = Constants.UNIT * 4;
	this.height = this.width;

	this.overlapWidth = this.width + Constants.UNIT;
	this.overlapHeight = this.overlapWidth;

	this.fieldWidth = 0;
	this.fieldHeight = 0;

	this.fieldOffset = new app.b2Vec2();

	this.fieldBoarder = null;

	this.echo = null;

	this.arrMarkers = [];
	
	this.init();
};

Radar.SCALE = new app.b2Vec2(Constants.WIDTH / 64, Constants.HEIGHT / 64);

/** 
*@public
*/
Radar.prototype.init = function() {
	this.container = new createjs.Container();

	this.background = new createjs.Shape();
	this.background.graphics
			.ss(1)
			.s(Constants.DARK_BLUE)
			.f(Constants.BLUE)
			.dr(0, 0, this.width, this.height);
	this.background.alpha = 0.25;

	this.fieldContainer = new createjs.Container();

	this.setEcho();

	this.mask = new createjs.Shape();
	this.mask.graphics
		.f(Constants.BLACK)
		.dc(0, 0, (this.width * 0.5));

	this.container.x = Constants.WIDTH - this.width;
	this.mask.x = this.container.x + (this.width * 0.5);
	this.mask.y = this.container.y + (this.height * 0.5);

	this.container.addChild(this.background);
	this.container.addChild(this.fieldContainer);
	this.container.addChild(this.echo);
	this.container.mask = this.mask;
};

/**
*@public
*/
Radar.prototype.update = function(options) {
	var arrEnemySystems = options.arrEnemySystems,
		arrEnemies = null,
		playerMarker = this.arrMarkers[PlayerTank.KEY],
		arrEnemyMarkers = null,
		enemy = null,
		marker = null,
		camera = options.camera,
		player = options.player,
		key = "",
		i = -1;

	//update radar echo effect
	this.echo.rotation -= 2;

	//update field container postion to that of camera
	this.fieldContainer.x = (camera.position.x / Radar.SCALE.x) + this.fieldOffset.x;
	this.fieldContainer.y = (camera.position.y / Radar.SCALE.y) + this.fieldOffset.y;

	//update player marker
	playerMarker.shape.x = player.position.x / Radar.SCALE.x;
	playerMarker.shape.y = player.position.y / Radar.SCALE.y;

	//update enemy markers
	for(key in arrEnemySystems) {
		arrEnemies = arrEnemySystems[key].arrEnemies;
		arrEnemyMarkers = this.arrMarkers[key];

		i = -1;
		while(++i < arrEnemies.length) {
			enemy = arrEnemies[i];
			marker = arrEnemyMarkers[i];

			if(enemy.isAlive) {
				if(this.fieldContainer.getChildIndex(marker.shape) < 0) {
					this.fieldContainer.addChild(marker.shape);
				}

				//update the marker based on enemy position divided by scale
				marker.shape.x = enemy.position.x / Radar.SCALE.x;
				marker.shape.y = enemy.position.y / Radar.SCALE.y;
			} else {
				//enemy is not alive so if marker is present on container it gets removed
				if(this.fieldContainer.getChildIndex(marker.shape) > -1) {
					this.fieldContainer.removeChild(marker.shape);
				}
			}
		}
	}
};

/**
*@public
*/
Radar.prototype.clear = function() {
	//TODO: Clean this up...
};

/**
*@public
*/
Radar.prototype.setField = function(w, h, player, arrEnemySystems) {
	var arrEnemies = null;

	//set field-related dimensions
	this.fieldWidth = w / Radar.SCALE.x;
	this.fieldHeight = h / Radar.SCALE.y;

	this.fieldOffset.x = (Constants.WIDTH / Radar.SCALE.x) * 0.5;
	this.fieldOffset.y = (Constants.HEIGHT / Radar.SCALE.y) * 0.5;

	//create border
	this.fieldBoarder = new createjs.Shape();
	this.fieldBoarder.graphics
		.ss(2)
		.s(Constants.LIGHT_BLUE)
		.dr(0, 0, this.fieldWidth, this.fieldHeight);

	this.fieldBoarder.alpha = 0.5;
	this.fieldBoarder.cache(0, 0, this.fieldWidth, this.fieldHeight);
	this.fieldContainer.addChild(this.fieldBoarder);

	//create and add player marker to radar
	this.arrMarkers[PlayerTank.KEY] = new Marker(player);
	this.fieldContainer.addChild(this.arrMarkers[PlayerTank.KEY].shape);

	//create enemy marker pools
	for(var key in arrEnemySystems) {
		arrEnemies = arrEnemySystems[key].arrEnemies;
		this.arrMarkers[key] = [];

		for(var i = 0; i < arrEnemies.length; i++) {
			this.arrMarkers[key][i] = new Marker(arrEnemies[i]);
		}
	}
};

/**
*@private
*/
Radar.prototype.setEcho = function() {
	var numGradients = 75,
		alpha = 1,
		alphaInc = 1 / numGradients,
		trigTable = app.trigTable,
		radius = this.width * 0.5,
		gradient = null,
		deg = 0,
		strokeWidth = 2,
		i = -1;

	this.echo = new createjs.Container();
	this.echo.x = this.container.x + radius;
	this.echo.y = this.container.y + radius;

	while(++i < numGradients) {
		deg = i - numGradients;

		gradient = new createjs.Shape();
		gradient.graphics
			.ss(strokeWidth)
			.s(Constants.LIGHT_BLUE)
	 		.mt(0, 0)
			.lt(trigTable.cos(deg) * radius, trigTable.sin(deg) * radius);
		gradient.alpha = alpha;

		this.echo.addChild(gradient);

		alpha -= alphaInc;

		strokeWidth = 0.5;
	};

	this.echo.alpha = 0.25;
	this.echo.cache(0, -radius, radius, radius);
};