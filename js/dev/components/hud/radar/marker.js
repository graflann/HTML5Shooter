goog.provide('Marker');

/**
*@constructor
*Marker component
*/
Marker = function(gameObject) {	
	this.gameObject = gameObject;

	this.color = Constants.BLACK;

	this.shape = null;

	this.width = 4;
	this.height = 4;
	
	this.init();
};

/** 
*@public
*/
Marker.prototype.init = function() {
	this.shape = new createjs.Shape();

	if(this.gameObject instanceof Enemy) {
		if(this.gameObject instanceof EnemyDrone ||
			this.gameObject instanceof EnemyTank
		) {
			this.color = Constants.RED;
		} else if(this.gameObject instanceof EnemyTurret ||
			this.gameObject instanceof EnemyCopter
		) {
			this.color = Constants.YELLOW;
		}

		this.shape.graphics
			.f(this.color)
			.dr(0, 0, this.width, this.height);
			
	} else if(this.gameObject instanceof PlayerTank ) {
		this.color = Constants.LIGHT_BLUE;

		this.shape.graphics
			.f(this.color)
			.dc(0, 0, this.width * 0.75);
	}

	this.shape.alpha = 0.75;
};

/**
*@public
*/
Marker.prototype.clear = function() {
	
};