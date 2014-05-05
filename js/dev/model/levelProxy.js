goog.provide('LevelProxy');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('EventNames');

/**
*@constructor
*Entity that loads / retrieves w/external level data
*/
LevelProxy = function() {

	this.levelIndex = 0;

	this.currentPath = "";

	this.currentLevelData = null;

	this.init();
};

goog.inherits(LevelProxy, goog.events.EventTarget);

LevelProxy.PATH = "data/level";

/**
*@private
*/
LevelProxy.prototype.init = function() {
	this.setLevel(1);
};

LevelProxy.prototype.clear = function() {
	this.currentLevelData = null;
};

/**
*@private
*/
LevelProxy.prototype.load = function() {
	this.loadXHR();
};

/**
 * Load and map JSON data to SpriteSheets via ajax calls seperate from the queue manifest
 * (PreloaderJS loadManifest does not allow XHR calls to JSON (and other) data file types)
 * @return {[type]} [description]
 */
LevelProxy.prototype.loadXHR = function() {
	var proxy = this;

	$.get(this.currentPath, function(data) {
		//proxy.currentLevelData = JSON.parse(data);
		proxy.currentLevelData = data;

		goog.events.dispatchEvent(proxy, new goog.events.Event(EventNames.LOAD_COMPLETE, proxy));
	})
	.done(function() {
		console.log("Done");
	})
	.fail(function() { 
		console.log("Fail");
	})
	.always(function() { 
		console.log("Always");
	});
};

LevelProxy.prototype.setLevel = function(index) {
	this.currentPath = LevelProxy.PATH + index.toString() + ".json";
};

LevelProxy.prototype.getImageNames = function() {
	return this.currentLevelData.images;
};

LevelProxy.prototype.getSoundNames = function() {
	return this.currentLevelData.sounds;
};

goog.exportSymbol('LevelProxy', LevelProxy);