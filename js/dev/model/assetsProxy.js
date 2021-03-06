goog.provide('AssetsProxy');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('EventNames');

/**
*@constructor
*Entity that loads / retrieves w/external asset data
*/
AssetsProxy = function() {	
	/**
	*PreloadJS file-loading object; sets useXHR to false to load some file types by tag
    *@type {LoadQueue}
    */
	this.imageQueue = new createjs.LoadQueue(false);

	this.soundQueue = new createjs.LoadQueue(false);

	this.arrImageNames = null;

	this.arrSoundNames = null;
	
	/**
	*Instantiate array of SpriteSheet instances using JSON data
    *@type {Array.<SpriteSheet>}
    */
	this.arrSpriteSheet = [];

	/**
	*Cache an array of JSON instances mapped to arrSpriteSheet
	*--Must map to same indices as respective img files--
	*master compiled spritesheet is used in prod, individual files in dev
    *@type {Array.<SpriteSheet>}
    */
	this.arrSpriteSheetData = [];

	/**
	 * Caches resources in Array for image queue manifest
	 * --Must map to same indices as respective json files--
	 * @type {Array}
	 */
	this.arrImageManifest = [];

	/**
	*Caches sound instances for manipulation
	*/
	this.arrSoundInstances = [];

	/**
	 * Caches resources in Array for sound queue manifest
	 * @type {Array}
	 */
	this.arrSoundManifest = [];

	/**
	 * Current asset index for arrSpriteSheetData / arrManifest use
	 * @type {Number}
	 */
	this.assetIndex = 0;

	this.completeEvent = new goog.events.Event(EventNames.LOAD_COMPLETE, this);

	//createjs.Sound.alternateExtensions = ["mp3"];
};

goog.inherits(AssetsProxy, goog.events.EventTarget);

AssetsProxy.IMAGE_PATH = "assets/finished/";

AssetsProxy.SOUND_PATH = "assets/sound/";

/**
*@private
*/
AssetsProxy.prototype.load = function(arrImageNames, arrSoundNames) {
	this.setImageManifest(arrImageNames);

	if (arrSoundNames){
		this.setSoundManifest(arrSoundNames);
	}

	this.loadImages();
};

AssetsProxy.prototype.loadImages = function () {
	var proxy = this;

	//event handling
	this.imageQueue.addEventListener("complete", 	function(e) { proxy.onImagesComplete(e); });
	this.imageQueue.addEventListener("progress", 	function(e) { proxy.onProgress(e); });
	this.imageQueue.addEventListener("fileload", 	function(e) { proxy.onFileLoad(e); });
	this.imageQueue.addEventListener("error", 		function(e) { proxy.onError(e); });
	
	//lload images using manifest
	this.imageQueue.loadManifest(this.arrImageManifest);
};

AssetsProxy.prototype.loadSounds = function () {
	var proxy = this;

	if(this.arrSoundManifest) {
		//install plug-ins prior to any file loading dependent on that plug-in
		this.soundQueue.installPlugin(createjs.Sound); //sound

		//event handling
		this.soundQueue.addEventListener("complete", 	function(e) { proxy.onSoundsComplete(e); });
		this.soundQueue.addEventListener("progress", 	function(e) { proxy.onProgress(e); });
		this.soundQueue.addEventListener("fileload", 	function(e) { proxy.onFileLoad(e); });
		this.soundQueue.addEventListener("error", 		function(e) { proxy.onError(e); });

		//register and load sounds using manifest
		createjs.Sound.registerManifest(this.arrSoundManifest);

		this.soundQueue.loadManifest(this.arrSoundManifest);
	} else {
		goog.events.dispatchEvent(this, this.completeEvent);
	}
};

/**
*@private
*/
AssetsProxy.prototype.setImageManifest = function(arrImageNames) {
	var key;

	if(this.arrImageNames) {
		this.arrImageNames.length = 0;
		this.arrImageNames = null;
	}

	this.arrImageNames = arrImageNames;

	for(key in this.arrSpriteSheet) {
		this.arrSpriteSheet[key] = null;
	}
	this.arrSpriteSheet = null;
	this.arrSpriteSheet = [];

	for(key in this.arrProgrammaticSpriteSheet) {
		this.arrProgrammaticSpriteSheet[key] = null;
	}
	this.arrProgrammaticSpriteSheet = null;
	this.arrProgrammaticSpriteSheet = [];

	this.arrImageManifest.length = 0;
	this.arrSpriteSheetData.length = 0;

	this.assetIndex = 0;

	//reset LoadQueue instance for reuse
	this.imageQueue.removeAll();

	//build sprite sheet data array and image manifest
	for(var i = 0; i < this.arrImageNames.length; i++) {
		this.arrSpriteSheetData.push(AssetsProxy.IMAGE_PATH + this.arrImageNames[i] + '.json');

		this.arrImageManifest.push({
			id: this.arrImageNames[i],
			src: AssetsProxy.IMAGE_PATH + this.arrImageNames[i] + '.png'
		});
	}
};

/**
*@private
*/
AssetsProxy.prototype.setSoundManifest = function(arrSoundNames) {
	if(this.arrSoundNames) {
		this.arrSoundNames.length = 0;
		this.arrSoundNames = null;
	}

	this.arrSoundNames = arrSoundNames;

	this.arrSoundManifest.length = 0;

	for(var key in this.arrSoundInstances) {
		this.arrSoundInstances[key] = null;
	}
	this.arrSoundInstances = null;
	this.arrSoundInstances = [];

	//reset LoadQueue instance for reuse
	this.soundQueue.removeAll();

	//build sound manifest
	for(i = 0; i < this.arrSoundNames.length; i++) {
		this.arrSoundManifest.push({
			id: this.arrSoundNames[i],
			src: AssetsProxy.SOUND_PATH + this.arrSoundNames[i] + '.ogg',
			data: 8 //set to a default of 8 of the same sound can be played at once
		});
	}
};

/**
 * Load and map JSON data to SpriteSheets via ajax calls seperate from the queue manifest
 * (PreloaderJS loadManifest does not allow XHR calls to JSON (and other) data file types)
 * @return {[type]} [description]
 */
AssetsProxy.prototype.loadXHR = function() {
	var proxy = this;

	$.get(proxy.arrSpriteSheetData[proxy.assetIndex], function(data) {
		//override image property to use preloaded img file from the queue
		data.images[0] = proxy.imageQueue.getResult(proxy.arrImageManifest[proxy.assetIndex].id);

		//map the data to a hash of SpriteSheet instances
		proxy.arrSpriteSheet[proxy.arrImageManifest[proxy.assetIndex].id] = new createjs.SpriteSheet(data);

		proxy.assetIndex++;

		if(proxy.assetIndex < proxy.arrImageManifest.length) {
			proxy.loadXHR();
		} else {
			proxy.loadSounds();
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

//PUBLIC HELPER METHODS
//IMAGES
/**
*@public
*/
AssetsProxy.prototype.getSpriteSheet = function(key) {
	return proxy.arrSpriteSheet[key];
};

//SOUND
/**
*@public
*/
AssetsProxy.prototype.playSound = function(id, volume, isLooping) {
	var self = this,
		sound = createjs.Sound.play(id, createjs.Sound.INTERRUPT_ANY),
		qualifiedVolume = volume || 1;

	sound.stop();
	sound.volume = qualifiedVolume;
	sound.play();

	if(isLooping != undefined && isLooping == true) {

		sound.addEventListener("complete", onComplete);

		function onComplete() {
			sound.stop();
		    self.playSound(id, qualifiedVolume, isLooping);
		}
	}
};

//EVENT HANDLERS////////////////////////////////////
/**
*@private
*/
AssetsProxy.prototype.onImagesComplete = function(e) { 
	console.log("Image load complete");

	this.imageQueue.removeAllEventListeners();

	this.loadXHR();
};

/**
*@private
*/
AssetsProxy.prototype.onSoundsComplete = function(e) {
	for(var i = 0; i < this.arrSoundNames.length; i++) {
		this.arrSoundInstances[this.arrSoundNames[i]] = createjs.Sound.createInstance(this.arrSoundNames[i]);
	}

	console.log("Sound load complete");

	this.soundQueue.removeAllEventListeners();

	goog.events.dispatchEvent(this, this.completeEvent);
};

/**
*@private
*/
AssetsProxy.prototype.onProgress = function(e) {
	console.log(e + " loading in progress.");
};

/**
*@private
*/
AssetsProxy.prototype.onFileLoad = function(e) {
	console.log(e + " has loaded.");
};

/**
*@private
*/
AssetsProxy.prototype.onError = function(e) {
	console.log(e.item.id.toString() + " haz mad loading errorz dawg");
};

goog.exportSymbol('AssetsProxy', AssetsProxy);