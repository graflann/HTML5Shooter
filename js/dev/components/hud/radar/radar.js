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

	this.width = 128;
	this.height = 128;

	this.fieldWidth = 0;
	this.fieldHeight = 0;

	this.scale = Constants.HEIGHT / 128;

	this.arrMarkers = [];
	
	this.init();
};

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

	this.mask = new createjs.Shape();
	this.mask.graphics
		.f(Constants.BLACK)
		.dc(0, 0, (this.width * 0.5));

	this.container.x = Constants.WIDTH - this.width;
	this.mask.x = this.container.x + (this.width * 0.5);
	this.mask.y = this.container.y + (this.height * 0.5);

	this.container.addChild(this.background);
	this.container.addChild(this.fieldContainer);
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

	//update field container postion to that of camera
	this.fieldContainer.x = (camera.position.x / this.scale) + this.fieldOffset;
	this.fieldContainer.y = camera.position.y / this.scale;

	//update player marker
	playerMarker.shape.x = player.position.x / this.scale;
	playerMarker.shape.y = player.position.y / this.scale;

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

				marker.shape.x = enemy.position.x / this.scale;
				marker.shape.y = enemy.position.y / this.scale;
			} else {
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
	
};

/**
*@private
*/
Radar.prototype.setField = function(w, h, player, arrEnemySystems) {
	var arrEnemies = null;

	this.fieldWidth = w / this.scale;
	this.fieldHeight = h / this.scale;
	this.fieldOffset = (Constants.WIDTH / this.scale) * 0.175;

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