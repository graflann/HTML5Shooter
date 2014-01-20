goog.provide('Rotor');

/**
*@constructor
*/
Rotor = function(color, radius, thickness) {
	this.color = color;

	this.radius = radius;

	this.thickness = thickness || 2;

	this.container = null;

	this.shape = null;
	
	this.init();
};

Rotor.ROTATION_RATE = -25;

/**
*@private
*/
Rotor.prototype.init = function() {
	this.container = new createjs.Container();

	this.setPropellers();
	this.setOuterGuard();
};

/**
*@public
*/
Rotor.prototype.update = function(options) {
	this.container.rotation += Rotor.ROTATION_RATE;
};

/**
*@public
*/
Rotor.prototype.clear = function() {
	this.container.removeChildren();

	this.shape.graphics.clear();
	this.shape = null;
};

/**
*Rotors mades from multiple strokes with descending alpha to creates a gradient look
*@private
*/
Rotor.prototype.setPropellers = function() {
	var totalGradients = 360,
		numGradients = 180,
		alpha = 1,
		alphaInc = 1 / numGradients,
		trigTable = app.trigTable,
		gradient = null,
		deg = 0,
		strokeWidth = 2,
		i = -1;

	while(++i < totalGradients) {
		deg = i - totalGradients;

		//reset the alpha and stroke width every 180 degrees
		if(deg % numGradients === 0) {
			alpha = 1;
			strokeWidth = 2;
		}

		gradient = new createjs.Shape();
		gradient.graphics
			.ss(strokeWidth)
			.s(this.color)
	 		.mt(0, 0)
			.lt(trigTable.cos(deg) * this.radius, trigTable.sin(deg) * this.radius);
		gradient.alpha = alpha;

		this.container.addChild(gradient);

		alpha -= alphaInc;

		strokeWidth = 0.5;
	};
};

/**
*Outer circle Shape that encloses the propellers
*@private
*/
Rotor.prototype.setPropellerGuard = function() {
	var diameter = this.radius * 2,
		cacheRadius = this.radius + this.thickness,
		cacheDiameter = cacheRadius * 2;

	this.shape = new createjs.Shape();
	this.shape.graphics
		.ss(this.thickness)
		.s(this.color)
		.dc(0, 0, this.radius);
	this.shape.snapToPixel = true;

	//cache dims include stroke thickness or the image is inappropriately cropped
	this.container.addChild(this.shape);
	this.container.cache(-cacheRadius, -cacheRadius, cacheDiameter, cacheDiameter);
};
