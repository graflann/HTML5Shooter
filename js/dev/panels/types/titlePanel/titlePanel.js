goog.provide('TitlePanel');

goog.require('Panel');
goog.require('GameOptions');

/**
*@constructor
*Title screen
*/
TitlePanel = function() {
	Panel.call(this);

	this.container = null;
	
	this.background = null;

	this.grid = null;

	this.title = null;

	this.titleComponent = null;

	this.gameOptions = null;

	this.load();
};

goog.inherits(TitlePanel, Panel);

TitlePanel.prototype.load = function() {
	goog.events.listen(
		app.assetsProxy, 
		EventNames.LOAD_COMPLETE, 
		this.onLoadComplete, 
		false, 
		this
	);

	app.assetsProxy.load(
		["titleGraphic"], 
		["Dark Curiosity"]
	);
};

/**
*@override
*@protected
*/
TitlePanel.prototype.init = function() {	
    var stage = app.layers.getStage(LayerTypes.MAIN);

    this.container = new createjs.Container();

    this.background = new createjs.Shape();
	this.background.graphics
		.lf([Constants.DARK_BLUE, Constants.BLACK], [0, 0.75], 0, 0, 0, Constants.HEIGHT)
		.dr(0, 0, Constants.WIDTH, Constants.HEIGHT);

	this.grid = new Grid(
		Constants.WIDTH + Constants.UNIT, 
		Constants.HEIGHT, 
		Constants.UNIT, 
		Constants.WHITE
	);

	this.grid.autoScroll = true;

	this.gameOptions = new GameOptions();
	this.gameOptions.container.x = (Constants.WIDTH * 0.5) - (this.gameOptions.width * 0.5);
	this.gameOptions.container.y = Constants.HEIGHT * 0.75;
	this.gameOptions.container.alpha = 0;
	this.gameOptions.container.visible = false;


	this.container.addChild(this.grid.shape);
	this.container.addChild(this.gameOptions.container);

	stage.addChild(this.background);
	stage.addChild(this.container);

	goog.events.listen(
		this.gameOptions, 
		EventNames.OPTION_SELECT, 
		this.onOptionSelect, 
		false, 
		this
	);
};

/**
*@override
*@protected
*/
TitlePanel.prototype.update = function() {
	Panel.prototype.update.call(this);

	if(this.grid) {
		this.grid.update();
	}

	if(this.gameOptions.container.visible) {
		this.gameOptions.update();
	}

	app.input.checkPrevButtonDown([
		GamepadCode.BUTTONS.DPAD_UP,
		GamepadCode.BUTTONS.DPAD_DOWN,
		GamepadCode.BUTTONS.DPAD_LEFT,
		GamepadCode.BUTTONS.DPAD_RIGHT,
		GamepadCode.BUTTONS.START,
		GamepadCode.BUTTONS.A
	]);
};

/**
*@override
*@protected
*/
TitlePanel.prototype.clear = function() {
	Panel.prototype.clear.call(this);

	this.container.removeAllChildren();
	this.container = null;

	this.background.graphics.clear();
	this.grid.clear();
	this.titleComponent.graphics.clear();
	this.gameOptions.clear();

	this.background = null;
	this.grid = null;
	this.titleComponent = null;
	this.title = null;
	this.gameOptions = null;
};

TitlePanel.prototype.setTitle = function() {
	var self = this,
		titleDest = null,
		titleComponentDest = null,
		width = 0,
		titleSpriteSheet = app.assetsProxy.arrSpriteSheet["titleGraphic"];

	//the main title graphic "strike"
	this.title = new createjs.BitmapAnimation(titleSpriteSheet);
	width = titleSpriteSheet._frames[0].rect.width;

	titleDest = new app.b2Vec2(
		(Constants.WIDTH * 0.5) - (width * 0.5), 
		Constants.HEIGHT * 0.125
	);

	titleComponentDest = new app.b2Vec2(
		titleDest.x + 10,
		titleDest.y + 43
	);

	this.title.x = titleDest.x - 240; 	//initial horizontal offset
	this.title.y = titleDest.y + 80;	//initial vertical offset	
	this.title.scaleX = 2;
	this.title.scaleY = 0;
	this.title.gotoAndStop(0);

	//the auxilliary title component graphic "flash" the flies in from the right
	this.titleComponent = new createjs.Shape();
	this.titleComponent.graphics
		.ss(1)
		.s(Constants.RED)
		.lf([Constants.YELLOW, Constants.RED], [0, 0.75], 0, 0, 472, 0)
		.mt(0, 21)
		.lt(39, 0)
		.lt(472, 21)
		.lt(39, 41)
		.lt(0, 21);
	this.titleComponent.x = Constants.WIDTH * 2;
	this.titleComponent.y = titleComponentDest.y + 10;
	this.titleComponent.scaleY = 0.5;
	this.titleComponent.alpha = 0.25;

	this.container.addChild(this.title);
	this.container.addChild(this.titleComponent);

	//set title component animation sequences
	var sequence3 = function(){
			self.gameOptions.container.visible = true;

			createjs.Tween.get(self.gameOptions.container)
				.to({ alpha: 1 }, 250);
		},
		sequence2 = function(){
			createjs.Tween.get(self.titleComponent)
				.to({ 
					alpha: 0.75, 
					scaleY: 1, 
					y: titleComponentDest.y 
				}, 250)
				.call(sequence3);		
		},
		sequence1 = function(){
			createjs.Tween.get(self.titleComponent)
				.wait(250)
				.to({ 
					x: titleComponentDest.x 
				}, 500, createjs.Ease.linear)
				.call(sequence2);
		};

	//tween title name graphic in
	createjs.Tween.get(this.title)
		.to({ 
			x: titleDest.x,
			y: titleDest.y,
			scaleX: 1, 
			scaleY: 1 
		}, 750);

	//tween in title component "flash"
	sequence1();
};

TitlePanel.prototype.onLoadComplete = function(e) {
	var self = this;

	goog.events.unlisten(
    	app.assetsProxy, 
    	EventNames.LOAD_COMPLETE, 
    	this.onLoadComplete, 
    	false, 
    	this
    );

	this.init();

	//app.assetsProxy.playSound("Dark Curiosity");

	this.isInited = true;

	setTimeout(function() {
			self.setTitle();
	}, 1000);

	//once loaded and inited notify the game to remove the loading screen
    goog.events.dispatchEvent(this, new goog.events.Event(EventNames.PANEL_LOAD_COMPLETE, this));
};

TitlePanel.prototype.onOptionSelect = function(e) {
	var self = this;

	createjs.Tween.get(this.container)
		.to({ 
			alpha: 0
		}, 1000)
		.call(function () { self.endOptionSelect(e); });	
};

TitlePanel.prototype.endOptionSelect = function(e) {
	this.isInited = false;

	goog.events.unlisten(
		this.gameOptions, 
		EventNames.OPTION_SELECT, 
		this.onOptionSelect, 
		false, 
		this
	);

	goog.events.dispatchEvent(
		this, 
		new PayloadEvent(
			EventNames.PANEL_CHANGE, 
			this,
			{ panelKey: e.target.panelKey }
		)
	);
};

