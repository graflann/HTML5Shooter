goog.provide('Grid');

/**
*@constructor
*Grid component
*@param {Number} 	unit
*@param {String} 	color
*/
Grid = function(w, h, unit, color) {
	/**
	*@type  {Number}
	*/
	this.unit = unit;

	this.width = w;

	this.height = h;
	
	/**
	*@type  {String}
	*/
	this.color = color;
	
	/**
	*@type {Shape}
	*/
	this.shape;

	this.alphaDelta = Grid.ALPHA_DELTA;
	
	this.init();
};

/**
*@public
*/
Grid.prototype.init = function() {
	var i = 0,
		w = this.width / this.unit,
		h = this.height / this.unit,
		x = 0,
		y = 0;
		
	this.shape = new createjs.Shape();
	this.shape.graphics.ss(0.5).s(this.color);
		
	for(i = 0; i < w; i++) {
		x = i * this.unit;
		this.shape.graphics.mt(x, 0).lt(x, this.height);
	}
	
	for(i = 0; i < h; i++) {
		y = i * this.unit;
		this.shape.graphics.mt(0, y).lt(this.width, y);
	}
	
	this.shape.alpha = 0.5;
};

Grid.ALPHA_DELTA = 0.005;

/**
*Scroll the grid automatically (use in background)
*@public
*/
Grid.prototype.update = function() {
	this.shape.alpha += this.alphaDelta;

	if(this.shape.alpha > 0.75) {
		this.alphaDelta =  -Grid.ALPHA_DELTA;
	} else if(this.shape.alpha < 0.25) {
		this.alphaDelta = Grid.ALPHA_DELTA;
	}
};

/**
*@public
*/
Grid.prototype.clear = function() {
	this.shape.graphics.clear();
	this.shape = null;
};