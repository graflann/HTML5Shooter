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

	this.width = w; //Constants.WIDTH * 4;

	this.height = h; //Constants.HEIGHT * 2;
	
	/**
	*@type  {String}
	*/
	this.color = color;
	
	/**
	*@type {Shape}
	*/
	this.shape;
	
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

/**
*@public
*/
Grid.prototype.clear = function() {
	this.shape.graphics.clear();
	this.shape = null;
};