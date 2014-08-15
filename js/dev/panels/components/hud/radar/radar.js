goog.provide('Radar');

goog.require('Marker');

/**
*@constructor
*Radar component
*/
Radar = function() {	
	this.container = null;

	this.externalContainer = null;

	this.fieldContainer = null;

	this.background = null;

	this.mask = null;

	this.width = Constants.UNIT * 4;
	this.height = this.width;

	this.distanceThreshold = Math.pow((this.width * 0.5), 2);

	this.overlapWidth = this.width + Constants.UNIT;
	this.overlapHeight = this.overlapWidth;

	this.fieldWidth = 0;
	this.fieldHeight = 0;

	this.fieldOffset = new app.b2Vec2();

	this.fieldBoarder = null;

	this.echo = null;

	this.arrMarkers = [];

	this.externalMarkerDistance = (this.width * 0.5) + 4;
	
	this.init();
};

Radar.SCALE_X = Constants.WIDTH / 64;
Radar.SCALE_Y = Constants.HEIGHT / 64;

Radar.OVERLAP = Constants.UNIT * 0.5;

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
			.dr(0, 0, this.overlapWidth, this.overlapHeight);
	this.background.alpha = 0.25;

	this.fieldContainer = new createjs.Container();

	this.setEcho();

	this.mask = new createjs.Shape();
	this.mask.graphics
		.f(Constants.BLACK)
		.dc(0, 0, (this.width * 0.5));

	this.container.x = Constants.WIDTH - this.overlapWidth;
	this.mask.x = this.container.x + (this.overlapWidth * 0.5);
	this.mask.y = this.container.y + (this.overlapHeight * 0.5);

	this.container.addChild(this.background);
	this.container.addChild(this.fieldContainer);
	this.container.addChild(this.echo);
	this.container.mask = this.mask;

	this.externalContainer = new createjs.Container();
	this.externalContainer.x = this.container.x + this.echo.x;
	this.externalContainer.y = this.container.y + this.echo.y;
};

/**
*@public
*/
Radar.prototype.update = function(options) {
	var arrEnemySystems = options.arrEnemySystems,
		playerMarker = this.arrMarkers[PlayerTank.KEY],
		camera = options.camera,
		player = options.player,
		playerMarkerPos = new app.b2Vec2(player.position.x / Radar.SCALE_X, player.position.y / Radar.SCALE_Y);

	//update radar echo effect
	this.echo.rotation -= 2;

	//update field container postion to that of camera
	this.fieldContainer.x = (camera.position.x / Radar.SCALE_X) + this.fieldOffset.x;
	this.fieldContainer.y = (camera.position.y / Radar.SCALE_Y) + this.fieldOffset.y;

	//update player marker
	playerMarker.shape.x = playerMarkerPos.x;
	playerMarker.shape.y = playerMarkerPos.y;

	//update enemy markers
	this.updateEnemyMarkers(player, playerMarkerPos, arrEnemySystems);
};

/**
*@public
*/
Radar.prototype.clear = function() {
	var i = 0;

	this.container.removeAllChildren();
	this.container = null;

	this.externalContainer.removeAllChildren();
	this.externalContainer = null;

	this.fieldContainer.removeAllChildren();
	this.fieldContainer = null;

	this.background.graphics.clear();
	this.background = null;

	this.mask = null;

	this.fieldOffset = null;

	this.fieldBoarder.graphics.clear();
	this.fieldBoarder = null;

	this.echo.removeAllChildren();
	this.echo = null;

	for(i = 0; i < this.arrMarkers.length; i++) {
		this.arrMarkers[i].clear();
		this.arrMarkers[i] = null;
	}
	this.arrMarkers = null;
};

Radar.prototype.updateEnemyMarkers = function(player, playerMarkerPos, arrEnemySystems) {
	var arrEnemyMarkers = null,
		arrEnemies = null,
		enemy = null,
		marker = null,
		enemyMarkerPos = new app.b2Vec2(0, 0),
		key = "",
		i = -1;

	for(key in arrEnemySystems) {
		arrEnemies = arrEnemySystems[key].arrEnemies;
		arrEnemyMarkers = this.arrMarkers[key];

		i = -1;
		while(++i < arrEnemies.length) {
			enemy = arrEnemies[i];
			marker = arrEnemyMarkers[i];

			//Enemy instance is within scope and depicted within radar
			if(enemy.isAlive) {
				enemyMarkerPos.x = enemy.position.x / Radar.SCALE_X;
				enemyMarkerPos.y = enemy.position.y / Radar.SCALE_Y;

				if(this.isEnemyInRadarScope(playerMarkerPos, enemyMarkerPos)) {
					this.updateMarkerWithinScope(enemyMarkerPos, marker);
				} else {
					this.updateMarkerOutOfScope(player, enemy, marker);
				}
			} else {
				//enemy is not alive so if marker is present on container it gets removed
				if(this.fieldContainer.getChildIndex(marker.shape) > -1) {
					this.fieldContainer.removeChild(marker.shape);
				}

				if(this.externalContainer.getChildIndex(marker.shape) > -1) {
					this.externalContainer.removeChild(marker.shape);
				}
			}
		}
	}
};

Radar.prototype.isEnemyInRadarScope = function(playerMarkerPos, enemyMarkerPos) {
	return (enemyMarkerPos.DistanceSqrd(playerMarkerPos) < this.distanceThreshold);
};

Radar.prototype.updateMarkerWithinScope = function(enemyMarkerPos, marker) {
	if(this.externalContainer.getChildIndex(marker.shape) > -1) {
		this.externalContainer.removeChild(marker.shape);
	}

	if(this.fieldContainer.getChildIndex(marker.shape) < 0) {
		this.fieldContainer.addChild(marker.shape);
	}

	//update the marker based on enemy position divided by scale
	marker.shape.x = enemyMarkerPos.x;
	marker.shape.y = enemyMarkerPos.y;
};

Radar.prototype.updateMarkerOutOfScope = function(player, enemy, marker) {
	var rad = Math.atan2(enemy.position.y - player.position.y, enemy.position.x - player.position.x),
		deg = Math.radToDeg(rad);

	if(this.fieldContainer.getChildIndex(marker.shape) > -1) {
		this.fieldContainer.removeChild(marker.shape);
	}

	if(this.externalContainer.getChildIndex(marker.shape) < 0) {
		this.externalContainer.addChild(marker.shape);
	}

	//update the marker based on enemy position divided by scale
	marker.shape.x = app.trigTable.cos(deg) * this.externalMarkerDistance;
	marker.shape.y = app.trigTable.sin(deg) * this.externalMarkerDistance;
};

/**
*@public
*/
Radar.prototype.setField = function(w, h, player, arrEnemySystems) {
	var arrEnemies = null;

	//set field-related dimensions
	this.fieldWidth = w / Radar.SCALE_X;
	this.fieldHeight = h / Radar.SCALE_Y;

	this.fieldOffset.x = ((Constants.WIDTH / Radar.SCALE_X) * 0.5) + Radar.OVERLAP;
	this.fieldOffset.y = ((Constants.HEIGHT / Radar.SCALE_Y) * 0.5) + Radar.OVERLAP;

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
		offset = this.overlapWidth * 0.5,
		gradient = null,
		deg = 0,
		strokeWidth = 2,
		i = -1;

	this.echo = new createjs.Container();
	this.echo.x = this.container.x + offset;
	this.echo.y = this.container.y + offset;

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