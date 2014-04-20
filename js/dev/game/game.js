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
goog.require('StateMachine');
goog.require('GameDefaultState');
goog.require('GamePadStatusState');
goog.require('MessageModal');

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
	* Updates the user of gamepad status and other messages
	*/
	this.modal = null;
	
	/**
	*@type {PanelFactory}
	*/
	this.factory = null;

	this.stateMachine = null;
	
	//this.load();
	this.init();
};

goog.inherits(Game, goog.events.EventTarget);

Game.GAMEPAD_MESSAGE = "Thank you for trying Strike, \nbut it currently requires a compatible gamepad." +
	"\n\nPlease plug one into an available USB port." +
	"\n\nIf you are seeing this message and a compatible pad is plugged in, \npress any button on the gamepad to continue.";

/**
*@private
*/
Game.prototype.init = function() {
	var self = this,
		input = app.input;

	this.factory = new PanelFactory();

	//true uses updated requestAnimationFrame instead of less optimized setTimeout
	//updates @ 60fps (this may change pending performance)
	createjs.Ticker.useRAF = true; 
	createjs.Ticker.setFPS(60);

	goog.events.listen(
		input, 
		EventNames.GAMEPAD_SUPPORT_UNAVAILABLE, 
		this.onGamePadSupportUnavailable,
		false, 
		this
	);

	goog.events.listen(
		input, 
		EventNames.GAMEPAD_STATUS_CHANGED, 
		this.onGamepadStatusChanged,
		false, 
		this
	);

	this.setStateMachine();

	//Need to validate polling of a well-formed gamepad instance per Chrome,
	//If Chrome does not has a native gamepad reference cached, 
	//the user is forced to enter a button to init native polling of gamepad
	if(input.validateGamepad()) {
		//Chrome has previously resolved a raw gamepad reference so init with default gaming state
		//this.addLoadingPanel();

		//this.setPanel(PanelTypes.TITLE_PANEL);
		//this.setPanel(PanelTypes.OPTIONS_PANEL);
		//this.setPanel(PanelTypes.PLAY_PANEL);
		//this.setPanel(PanelTypes.PATH_FINDING_PANEL);
		//this.setPanel(PanelTypes.LOADING_PANEL);

		this.stateMachine.setState(GameDefaultState.KEY);
	} else {
		//The polling test found no gamepad, so fire a modal to let user know to plug in / press button on pad to resolve its status
		this.stateMachine.setState(GamePadStatusState.KEY);
	}
		
	createjs.Ticker.addEventListener("tick", function() { self.update(); } );
};

/**
*@private
*/
Game.prototype.update = function() {
	app.layers.update();

	this.stateMachine.update();
};

Game.prototype.enterGame = function() {
	if(!this.currentPanel) {
		this.addLoadingPanel();

		this.setPanel(PanelTypes.TITLE_PANEL);
	}
};

Game.prototype.updateGame = function() {
	app.input.updateGamepads();

	if(this.currentPanel.isInited) {
		this.currentPanel.update();
	}

	if(this.loadingPanel) {
		this.loadingPanel.update();
	}
};

Game.prototype.exitGame = function() {
	
};

Game.prototype.enterGamepadStatus = function() {
	var message = "";

	message = Game.GAMEPAD_MESSAGE;

	this.modal = new MessageModal(message);

	app.layers.add(LayerTypes.MODAL, 10000);
	app.layers.getStage(LayerTypes.MODAL).addChild(this.modal.container);

	this.modal.animate();
};

Game.prototype.updateGamepadStatus = function() {
	app.input.updateGamepads();
};

Game.prototype.exitGamepadStatus = function() {
	app.layers.getStage(LayerTypes.MODAL).removeChild(this.modal.container);

	this.modal.clear();
	this.modal = null;

	app.layers.remove(LayerTypes.MODAL);
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

Game.prototype.setStateMachine = function() {
	this.stateMachine = new StateMachine();

	this.stateMachine.addState(
		GameDefaultState.KEY,
		new GameDefaultState(this),
		[ GamePadStatusState.KEY ]
	);

	this.stateMachine.addState(
		GamePadStatusState.KEY,
		new GamePadStatusState(this),
		[ GameDefaultState.KEY ]
	);
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

Game.prototype.onGamePadSupportUnavailable = function(e) {
	console.log("Game pad support is not available in this browser.");
};

Game.prototype.onGamepadStatusChanged = function(e) {
	console.log("Gamepad status changed: " + e.payload.toString());

	//toggle the state 
	switch(this.stateMachine.getCurrentState()) 
	{
	case GamePadStatusState.KEY:
		var self = this;

		this.modal.remove(function() {
			self.stateMachine.setState(GameDefaultState.KEY);
		})
		break;
	case GameDefaultState.KEY:
		this.stateMachine.setState(GamePadStatusState.KEY);
		break;
	}
};