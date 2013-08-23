goog.provide('AssetsProxy');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('EventNames');

/**
*@constructor
*Entity that loads / retrieves w/external data
*/
AssetsProxy = function()
{	
	/**
	*PreloadJS file-loading object; sets useXHR to false to load some file types by tag
    *@type {LoadQueue}
    */
	this.queue = new createjs.LoadQueue(false);
	
	/**
	*Instantiate array of SpriteSheet instances using JSON data
    *@type {Array.<SpriteSheet>}
    */
	this.arrSpriteSheet = [];

	/**
	*Cache an array of JSON instances mapped to arrSpriteSheet
	*--Must map to same indices as respective img files--
    *@type {Array.<SpriteSheet>}
    */
	this.arrSpriteSheetData = [
		'assets/finished/tankBase.json',
		'assets/finished/enemyTankBase.json',
		'assets/finished/bladeProjectile.json',
		'assets/finished/vulcanTurret.json',
		'assets/finished/spreadTurret.json',
		'assets/finished/railTurret.json',
		'assets/finished/bladeTurret.json'
	];

	/**
	 * Caches resources in Array for queue manifest
	 * --Must map to same indices as respective json files--
	 * @type {Array}
	 */
	this.arrManifest = [
		{id: "tankBase",			src: "assets/finished/tankBase.png"},
		{id: "enemyTankBase",		src: "assets/finished/enemyTankBase.png"},
		{id: "bladeProjectile",		src: "assets/finished/bladeProjectile.png"},
		{id: "vulcanTurret",		src: "assets/finished/vulcanTurret.png"},
		{id: "spreadTurret",		src: "assets/finished/spreadTurret.png"},
		{id: "railTurret",			src: "assets/finished/railTurret.png"},
		{id: "bladeTurret",			src: "assets/finished/bladeTurret.png"}
	];

	/**
	 * Current asset index for arrSpriteSheetData / arrManifest use
	 * @type {Number}
	 */
	this.assetIndex = 0;
};

goog.inherits(AssetsProxy, goog.events.EventTarget);

/**
*@private
*/
AssetsProxy.prototype.load = function()
{
	var proxy = this;

	//event handling
	this.queue.addEventListener("complete", function(e){ proxy.onComplete(e); });
	this.queue.addEventListener("progress", function(e){ proxy.onProgress(e); });
	this.queue.addEventListener("fileload", function(e){ proxy.onFileLoad(e); });
	this.queue.addEventListener("error", function(e){ proxy.onError(e); });
	
	//install plug-ins prior to any file loading dependent on that plug-in
	this.queue.installPlugin(createjs.Sound); //sound
	
	//total assets
	this.queue.loadManifest(this.arrManifest);
};

/**
 * Load and map JSON data to SpriteSheets via ajax calls seperate from the queue manifest
 * (PreloaderJS loadManifest does not allow XHR calls to JSON (and other) data file types)
 * @return {[type]} [description]
 */
AssetsProxy.prototype.loadXHR = function(){
	var proxy = this;

	$.get(proxy.arrSpriteSheetData[proxy.assetIndex], function(data) {
		data = JSON.parse(data);

		console.log(data);

		//override image property to use preloaded img file from the queue
		data.images[0] = proxy.queue.getResult(proxy.arrManifest[proxy.assetIndex].id);

		//map the data to a hash of SpriteSheet instances
		proxy.arrSpriteSheet[proxy.arrManifest[proxy.assetIndex].id] = new createjs.SpriteSheet(data);

		proxy.assetIndex++;

		if(proxy.assetIndex < proxy.arrManifest.length){
			proxy.loadXHR();
		} else {
			goog.events.dispatchEvent(proxy, new goog.events.Event(EventNames.LOAD_COMPLETE, proxy));
		}
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
AssetsProxy.prototype.onComplete = function(e)
{ 
	this.loadXHR();
};

/**
*@private
*/
AssetsProxy.prototype.onProgress = function(e)
{
	console.log("progress...");
	//show progress of loading and remove when complete
};

/**
*@private
*/
AssetsProxy.prototype.onFileLoad = function(e)
{
	console.log("fileLoaded...");
	console.log(e);
	//show progress of loading and remove when complete
};

/**
*@private
*/
AssetsProxy.prototype.onError = function(e)
{
	console.log(e);
	console.log(e.item.id.toString() + " haz mad queue loading errorz dawg");
};

goog.exportSymbol('AssetsProxy', AssetsProxy);