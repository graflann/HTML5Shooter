goog.provide('Game');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('EventNames');
goog.require('PayloadEvent');
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

	this.loadingPanel = null;
	
	/**
	*@type {PanelFactory}
	*/
	this.factory = null;
	
	//this.load();
	this.init();
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

	this.addLoadingPanel();

	this.setPanel(PanelTypes.TITLE_PANEL);
	//this.setPanel(PanelTypes.OPTIONS_PANEL);
	//this.setPanel(PanelTypes.PLAY_PANEL);
	//this.setPanel(PanelTypes.PATH_FINDING_PANEL);
	//this.setPanel(PanelTypes.LOADING_PANEL);
		
	createjs.Ticker.addEventListener("tick", function() { self.update(); } );
};

/**
*@private
*/
Game.prototype.update = function() {
	app.input.updateGamepads();

	if(this.currentPanel.isInited) {
		this.currentPanel.update();
	}

	if(this.loadingPanel) {
		this.loadingPanel.update();
	}
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

	goog.events.listen(
		this.currentPanel, 
		EventNames.PANEL_LOAD_COMPLETE, 
		this.onPanelLoadComplete, 
		false, 
		this
	);
};

Game.prototype.addLoadingPanel = function() {
	this.loadingPanel = this.factory.getPanel(PanelTypes.LOADING_PANEL);

	// goog.events.listen(
	// 	this.loadingPanel, 
	// 	EventNames.CLEAR_COMPLETE, 
	// 	this.onLoadPanelClearComplete, 
	// 	false, 
	// 	this
	// );
};

//EVENT HANDLING////////////////////////////////////////////////////////
/**
*@private
*/
Game.prototype.onPanelChange = function(e) {
	this.addLoadingPanel();

	this.setPanel(e.payload.panelKey);
};

/**
*@private
*/
Game.prototype.onPanelLoadComplete = function(e) {
	//this.loadingPanel.startClear();

	this.loadingPanel.clear();
	this.loadingPanel = null;

	goog.events.unlisten(
		this.currentPanel, 
		EventNames.PANEL_LOAD_COMPLETE, 
		this.onPanelLoadComplete, 
		false, 
		this
	);
};

/**
*@private
*/
Game.prototype.onLoadPanelClearComplete = function(e) {
	goog.events.unlisten(
		this.loadingPanel, 
		EventNames.CLEAR_COMPLETE, 
		this.onLoadPanelClearComplete, 
		false, 
		this
	);

	this.loadingPanel.clear();
	this.loadingPanel = null;
};