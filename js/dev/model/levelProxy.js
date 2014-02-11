goog.provide('LevelProxy');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('EventNames');

/**
*@constructor
*Entity that loads / retrieves w/external data
*/
LevelProxy = function() {	

};

goog.inherits(LevelProxy, goog.events.EventTarget);

/**
*@private
*/
LevelProxy.prototype.load = function() {
	
};

/**
 * Load and map JSON data to SpriteSheets via ajax calls seperate from the queue manifest
 * (PreloaderJS loadManifest does not allow XHR calls to JSON (and other) data file types)
 * @return {[type]} [description]
 */
LevelProxy.prototype.loadXHR = function() {
	var proxy = this;

	$.get(proxy.arrSpriteSheetData[proxy.assetIndex], function(data) {
		
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

/**
*@private
*/
LevelProxy.prototype.onComplete = function(e) { 
	
};

/**
*@private
*/
LevelProxy.prototype.onProgress = function(e) {
	console.log("progress...");
	//show progress of loading and remove when complete
};

/**
*@private
*/
LevelProxy.prototype.onFileLoad = function(e) {
	console.log("fileLoaded...");
	console.log(e);
	//show progress of loading and remove when complete
};

/**
*@private
*/
LevelProxy.prototype.onError = function(e) {
	console.log(e);
	console.log(e.item.id.toString() + " haz mad queue loading errorz dawg");
};

goog.exportSymbol('LevelProxy', LevelProxy);