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
*Game is the root-level of the entire application
*/
Game = function() {	
	/**
	*@type {Panel}
	*/
	this.currentPanel = null;
	
	/**
	*@type {PanelFactory}
	*/
	this.factory = null;
	
	goog.events.listen(
		app.assetsProxy, 
		EventNames.LOAD_COMPLETE, 
		this.onLoadComplete, 
		false, 
		this
	);

	app.assetsProxy.load();
};

goog.inherits(Game, goog.events.EventTarget);

/**
*@private
*/
Game.prototype.init = function() {
	var self = this;

	this.factory = new PanelFactory();

	//true uses updated requestAnimationFrame instead of less optimized setTimeout
	//updates @ 60fps (this may change pending performance)
	createjs.Ticker.useRAF = true; 
	createjs.Ticker.setFPS(60);

	this.setPanel(PanelTypes.PLAY_PANEL);
	//this.setPanel(PanelTypes.OPTIONS_PANEL);
		
	createjs.Ticker.addEventListener("tick", function() { self.update(); } );
};

/**
*@private
*/
Game.prototype.update = function() {
	app.input.updateGamepads();

	this.currentPanel.update();
};

/**
*@private
*/
Game.prototype.setPanel = function(key) {
	var self = this;

	if(this.currentPanel) {
		goog.events.unlisten(
			this.currentPanel, 
			EventNames.PANEL_CHANGE, 
			this.onPanelChange, 
			false, 
			this
		);

		this.currentPanel.clear();
		this.currentPanel = null;
	}
	
	this.currentPanel = this.factory.getPanel(key);

	goog.events.listen(
		this.currentPanel, 
		EventNames.PANEL_CHANGE, 
		this.onPanelChange, 
		false, 
		this
	);
};

//EVENT HANDLING////////////////////////////////////////////////////////
/**
*@private
*@param {goog.events.Event} e
**/
Game.prototype.onLoadComplete = function(e) {
    goog.events.unlisten(
    	app.assetsProxy, 
    	EventNames.LOAD_COMPLETE, 
    	this.onLoadComplete, 
    	false, 
    	this
    );

    this.init();
};

/**
*@private
*/
Game.prototype.onPanelChange = function(e) {
	this.setPanel(e.target.nextPanelKey);
}