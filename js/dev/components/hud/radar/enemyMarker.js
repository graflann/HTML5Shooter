goog.provide('EnemyMarker');

/**
*@constructor
*EnemyMarker component
*/
EnemyMarker = function(categoryBits) {	
	this.categoryBits = null;

	this.color = Constants.BLACK;

	this.shape = null;

	this.width = 4;
	this.height = 4;

	this.isAlive = false;
	
	this.init();
};

/** 
*@public
*/
EnemyMarker.prototype.init = function() {
	if(this.categoryBits === CollisionCategories.GROUND_ENEMY) {
		this.color = Constants.RED;
	} else {
		this.color = Constants.YELLOW;
	}

	this.shape = new createjs.Shape();
	this.shape.graphics
			.f(this.color)
			.dr(0, 0, this.width, this.height);
	this.shape.alpha = 0.75;
};

/**
*@public
*/
EnemyMarker.prototype.update = function(options) {

};

/**
*@public
*/
EnemyMarker.prototype.clear = function() {
	
};

/**
*@public
*/
EnemyMarker.prototype.add = function(container) {
	
};

/**
*@public
*/
EnemyMarker.prototype.kill = function() {
	this.shape.parent.removeChild(this.shape);
};