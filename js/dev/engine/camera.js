goog.provide('Camera');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');

/**
*@constructor
*/
Camera = function(target, arrStages, offset, minBounds, maxBounds) {
	this.target = target;

	this.arrStages = arrStages;

	/**
	 * [offset description]
	 * @type {Box2D.Common.Math.b2Vec2}
	 */
	this.offset = offset;

	/**
	 * [minBounds description]
	 * @type {Box2D.Common.Math.b2Vec2}
	 */
	this.minBounds = minBounds;

	/**
	 * [maxBounds description]
	 * @type {Box2D.Common.Math.b2Vec2}
	 */
	this.maxBounds = maxBounds;

	/**
	 * [position description]
	 * @type {Box2D.Common.Math.b2Vec2}
	 */
	this.position = new app.b2Vec2();

	/**
	 * [position description]
	 * @type {Box2D.Common.Math.b2Vec2}
	 */
	this.prevPosition = new app.b2Vec2();

	/**
	 * [position description]
	 * @type {Box2D.Common.Math.b2Vec2}
	 */
	this.translation = new app.b2Vec2();

	/**
	 * [position description]
	 * @type {Box2D.Common.Math.b2Vec2}
	 */
	this.normalizedTranslation = new app.b2Vec2();

	this.init();
};

goog.inherits(Camera, goog.events.EventTarget);

/**
*@public
*/
Camera.prototype.init = function() {
	
};

/**
*@public
*/
Camera.prototype.update = function() {
	this.prevPosition.x = this.position.x;
	this.prevPosition.y = this.position.y;

	this.position.x = -(this.target.x - this.offset.x);
	this.position.y = -(this.target.y - this.offset.y);

	this.checkBounds();
	this.translate();
	this.updateStages();
};

/**
*@public
*/
Camera.prototype.clear = function() {
	this.target = null;

	this.arrStages = null;

	this.offset = null;

	this.minBounds = null;

	this.maxBounds = null;

	this.position = null;

	this.prevPosition = null;

	this.translation = null;

	this.normalizedTranslation = null;
};

Camera.prototype.updateStages = function() {
	var i = -1,
		length = this.arrStages.length,
		stage;

	while(++i < length) {
		stage = this.arrStages[i];

		stage.x = this.position.x;
		stage.y = this.position.y;
	}
};

/**
*@override
*@public
*/
Camera.prototype.checkBounds = function() {
	var minX = this.minBounds.x,
		minY = this.minBounds.y, 
		maxX = this.maxBounds.x,
		maxY = this.maxBounds.y; 

	if(this.position.x < minX) {
		this.position.x = minX;
	} else if (this.position.x > maxX) {
		this.position.x = maxX;
	}

	if(this.position.y < minY) {
		this.position.y = minY;	
	} else if (this.position.y > maxY) {
		this.position.y = maxY;
	}
};

/**
*@override
*@public
*/
Camera.prototype.translate = function() {
	this.translation.x = this.position.x - this.prevPosition.x;
	this.translation.y = this.position.y - this.prevPosition.y;

	// this.normalizedTranslation.x = 0;
	// this.normalizedTranslation.y = 0;

	// if(this.translation.x !== 0) {
	// 	this.normalizedTranslation.x = this.translation.x / (Math.abs(this.translation.x));
	// }

	// if(this.translation.y !== 0) {
	// 	this.normalizedTranslation.y = this.translation.y / (Math.abs(this.translation.y));
	// }
};