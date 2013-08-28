goog.provide('Radar');

goog.require('EnemyMarker');

/**
*@constructor
*Radar component
*/
Radar = function() {	
	this.container = null;

	this.background = null;

	this.mask = null;

	this.width = 128;
	this.height = 128;

	this.arrEnemyMarkers = [];
	
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

	this.mask = new createjs.Shape();
	this.mask.graphics
		.f(Constants.BLACK)
		.dc(0, 0, (this.width * 0.5));

	this.container.mask = this.mask;

	this.container.x = Constants.WIDTH - this.width;
	this.mask.x = this.container.x + (this.width * 0.5);
	this.mask.y = this.container.y + (this.height * 0.5);

	this.container.addChild(this.background);
};

/**
*@public
*/
Radar.prototype.update = function(options) {
	// var arrEnemySystems = options.arrEnemySystems,
	// 	arrEnemies = null,
	// 	enemy = null,
	// 	camera = options.camera,
	// 	i = -1;

	// for(var key in this.arrEnemySystems) {
	// 	arrEnemies = arrEnemySystems[key].arrEnemies;

	// 	i = -1;
	// 	while(++i < arrEnemies.length) {
	// 		enemy = arrEnemies[i];

	// 		if(arr) {

	// 		}
	// 	}
	// }
};

/**
*@public
*/
Radar.prototype.clear = function() {
	
};

/**
*@private
*/
Radar.prototype.setMarkers = function(arrEnemySystems) {
	var arrEnemies = null;

	for(var key in arrEnemySystems) {
		arrEnemies = arrEnemySystems[key].arrEnemies;
		this.arrEnemyMarkers[key] = [];

		for(var i = 0; i < arrEnemies.length; i++) {
			this.arrEnemyMarkers[key][i] = new EnemyMarker(arrEnemies[i].categoryBits);
		}
	}

	console.log(this.arrEnemyMarkers);
};