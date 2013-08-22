goog.provide('Game');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('EventNames');
goog.require('PanelFactory');
goog.require('PanelTypes');
goog.require('AssetsProxy');
goog.require('Input');
goog.require('KeyCode');
goog.require('GamepadCode');

/**
*@constructor
*Game is the root-level of the entire piece
*/
Game = function() {
	/**
    *@type {Array.<Panel>}
    */
	this.arrPanels = [];
	
	/**
	*@type {Panel}
	*/
	this.currentPanel = null;
	
	/**
	*@type {PanelFactory}
	*/
	this.factory = null;
	
	/**
	*@type {Boolean}
	*/
	this.panelToggle = false;
	
	goog.events.listen(app.assetsProxy, EventNames.LOAD_COMPLETE, this.onLoadComplete, false, this);
	app.assetsProxy.load();
};

goog.inherits(Game, goog.events.EventTarget);

/**
*@private
*/
Game.prototype.init = function() {
	var self = this;
	
	this.factory = new PanelFactory();

	this.setPanel(PanelTypes.PLAY_PANEL);
		
	//true uses updated requestAnimationFrame instead of less optimized setTimeout
	//updates @ 60fps (this may change pending performance)
	createjs.Ticker.useRAF = true; 
	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick", function(){
		//update polling of connected game pad hardware; currently only first pad is polled
		app.input.updateGamepads();

		//main game update loop
		self.update();
	});

	// var bmpa = new createjs.BitmapAnimation(app.proxy.arrSpriteSheet["tankBase"]);
	// bmpa.play();
	// app.stage.addChild(bmpa);
	
	//setInterval(function(){
		//var key = "";
		//
		//self.panelToggle = !self.panelToggle;
		//
		//(self.panelToggle) ? key = PanelTypes.TITLE_PANEL : key = PanelTypes.PLAY_PANEL;
		//
		//self.setPanel(key);
	//},
	//3000);
};

/**
*@private
*/
Game.prototype.update = function() {
	var input = app.input;

	this.currentPanel.update();

	if(input.isKeyPressedOnce(KeyCode.F2)) {
		app.physicsDebug = !app.physicsDebug;

		this.setDebug();
	}

	input.checkPrevKeyDown([
		KeyCode.F2,
	]);
};

/**
*@private
*/
Game.prototype.setPanel = function(key) {
	if(this.currentPanel != null)
	{
		this.currentPanel.clear();
	}
	
	this.currentPanel = this.factory.getPanel(key);
};

/**
*@private
*/
Game.prototype.setDebug = function() {
	app.layers.setDebug(app.physicsDebug);
};

//EVENT HANDLING////////////////////////////////////////////////////////
/**
*@private
*@param {goog.events.Event} e
**/
Game.prototype.onLoadComplete = function(e) {
    goog.events.unlisten(app.assetsProxy, EventNames.LOAD_COMPLETE, this.onLoadComplete, false, this);

    this.init();
};

/**
*@private
*/
Game.prototype.onSetPanel = function(game, key){
	game.setPanel(key);
}