goog.provide('ItemSystem');

goog.require('Item');
goog.require('ItemClasses');

/**
*@constructor
*System managing items of a specific type
*/
ItemSystem = function(type, max, categoryBits) {
	this.type = type;

	this.max = max || 4;

	this.categoryBits = categoryBits || CollisionCategories.ITEM;

	this.isActive = true;

	this.arrItems = new Array(this.max);

	this.init();
};

goog.inherits(ItemSystem, goog.events.EventTarget);

ItemSystem.prototype.init = function() {
	var ItemClass = ItemClasses[this.type],
		i = -1;

	while(++i < this.max) {
		this.arrItems[i] = new ItemClass(this.categoryBits);
	}

};

ItemSystem.prototype.update = function(options) {
	var i = -1;

	while(++i < this.max) {
		this.arrItems[i].update(options);
	}
};

ItemSystem.prototype.clear = function() {
	var i = -1;

	while(++i < this.max) {
		this.arrItems[i].clear();
		this.arrItems[i] = null;
	}
	
	this.arrItems.length = 0;
	this.arrItems = null;
};

ItemSystem.prototype.kill = function() {
	var i = -1;

	while(++i < this.max) {
		this.arrItems[i].kill();
	}
};

ItemSystem.prototype.emit = function(quantity, options) {
	var i = -1,
		item,
		options = options || {};
		
	options.posX 		= options.posX || 0,
	options.posY 		= options.posY || 0,
	options.posOffsetX 	= options.posOffsetX || 0,
	options.posOffsetY 	= options.posOffsetY || 0,
	options.velX 		= options.velX || 0,
	options.velY 		= options.velY || 0,
	options.minScale 	= options.minScale || 1,
	options.maxScale 	= options.maxScale || 1,
	options.isRotated 	= options.isRotated || false;

	while (++i < quantity) {
		item = this.getItem();
		
		if (item) {
			item.create(options);
		}
	}
};

ItemSystem.prototype.getItem = function() {
	var i = -1,
		item;

	while(++i < this.max) {
		item = this.arrItems[i];

		if (!item.isAlive){
			return item;
		}
	}
	
	return null;
};

ItemSystem.prototype.getIsAlive = function() {
	var i = -1;
			
	while (++i < this.max){
		if(this.arrItems[i].isAlive) {
			return true;
		}
	}
	
	return false;
};

ItemSystem.prototype.length = function(){
	return this.arrItems.length;
};
