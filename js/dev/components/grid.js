goog.provide('Grid');

/**
*@constructor
*Grid component
*@param {Number} 	unit
*@param {String} 	color
*/
Grid = function(unit, color)
{
	/**
	*@type  {Number}
	*/
	this.unit = unit;
	
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
Grid.prototype.init = function()
{
	var i = 0,
		w = (Constants.WIDTH * 4) / this.unit,
		h = (Constants.HEIGHT * 2) / this.unit,
		x = 0,
		y = 0;
		
	this.shape = new createjs.Shape();
	this.shape.graphics.ss(0.5).s(this.color);
		
	for(i = 0; i < w; i++) {
		x = i * this.unit;
		this.shape.graphics.mt(x, 0).lt(x, (Constants.HEIGHT * 2));
	}
	
	for(i = 0; i < h; i++) {
		y = i * this.unit;
		this.shape.graphics.mt(0, y).lt((Constants.WIDTH * 4), y);
	}
	
	this.shape.alpha = 0.5;
};

/**
*@public
*/
Grid.prototype.clear = function()
{
	this.shape.getStage().removeChild(this.shape);
	
	this.shape = null;
};