goog.provide('EnemyCopterShadow');

goog.require('Shadow');

/**
*@constructor
*A shadow effect rendering below an airborne enemy to accentuate a sense of depth
*/
EnemyCopterShadow = function(parentObject) {
	Shadow.call(this, parentObject);

	this.arrRotors = [];

	this.init();
};

goog.inherits(EnemyCopterShadow, Shadow);

EnemyCopterShadow.OFFSET = new app.b2Vec2(48, 48);

EnemyCopterShadow.SCALE = 0.6;

/**
*@public
*/
EnemyCopterShadow.prototype.init = function() {
	Shadow.prototype.init.call(this);

	this.setRotors();
};

/**
*@public
*/
EnemyCopterShadow.prototype.update = function(options) {
	var i = -1,
		length = this.arrRotors.length;

	Shadow.prototype.update.call(this, options);

	this.position.x = this.container.x = this.parentObject.position.x + EnemyCopterShadow.OFFSET.x;
	this.position.y = this.container.y = this.parentObject.position.y + EnemyCopterShadow.OFFSET.y;

	this.container.rotation = this.parentObject.container.rotation;

	while(++i < length) {
	 	this.arrRotors[i].rotation = this.parentObject.arrRotors[i].shape.rotation;
	}
};

/**
*@public
*/
EnemyCopterShadow.prototype.clear = function() {
	var i = -1,
		length = this.arrRotors.length;

	Shadow.prototype.clear.call(this);

	while(++i < length) {
	 	this.arrRotors[i] = null;
	 	delete this.arrRotors[i];
	}	
	this.arrRotors = null;
};

/**
*@public
*/
EnemyCopterShadow.prototype.kill = function() {
	

};

/**
*@public
*/
EnemyCopterShadow.prototype.setRotors = function() {
	var radius = this.parentObject.arrRotors[0].radius,
		diameter = radius * 2;

	for(var i = 0; i < this.parentObject.arrRotors.length; i++) {
		this.arrRotors.push(this.parentObject.arrRotors[i].shape.clone(false));
		this.arrRotors[i].filters = Shadow.COLOR_FILTERS;
		this.arrRotors[i].cache(-radius, -radius, diameter, diameter);
		this.arrRotors[i].x = this.parentObject.arrRotors[i].shape.x;
		this.arrRotors[i].y = this.parentObject.arrRotors[i].shape.y;

		this.container.addChild(this.arrRotors[i]);
	}

	this.container.scaleX = EnemyCopterShadow.SCALE;
	this.container.scaleY = EnemyCopterShadow.SCALE;
};

goog.exportSymbol('EnemyCopterShadow', EnemyCopterShadow);