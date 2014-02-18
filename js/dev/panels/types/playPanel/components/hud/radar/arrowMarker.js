goog.provide('ArrowMarker');

/**
*@constructor
*ArrowMarker component
*/
ArrowMarker = function(gameObject) {	
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
ArrowMarker.prototype.init = function() {
	this.shape = new createjs.Shape();

	if(this.gameObject instanceof Enemy) {
		var w = 0,
			h = 0;

		//Air enemies are yellow
		if(this.gameObject instanceof EnemyTurret ||
			this.gameObject instanceof EnemyCopter
		) {
			this.color = Constants.YELLOW;
		} else if(this.gameObject instanceof EnemyCarrier) {
			this.color = Constants.YELLOW;

			//really large / boss enemies get a ArrowMarker twice the default size
			this.width *= 2;
			this.height *= 2;
		} else { //ground are red
			this.color = Constants.RED;
		}

		w = this.width * 0.5;
		h = this.height * 0.5;

		this.shape.graphics
			.f(this.color)
			.dr(-w, -h, this.width, this.height);

		this.shape.cache(-w, -h, this.width, this.height);
			
	} else if(this.gameObject instanceof PlayerTank ) {
		var radius = this.width * 0.75,
			diameter = radius * 2;

		this.color = Constants.LIGHT_BLUE;

		this.shape.graphics
			.f(this.color)
			.dc(0, 0, radius);

		this.shape.cache(-radius, -radius, diameter , diameter);
	}

	this.shape.alpha = 0.75;
};

/**
*@public
*/
ArrowMarker.prototype.clear = function() {
	
};