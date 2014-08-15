goog.provide('LevelSelectorContainer');

goog.require('LevelSelector');
goog.require('SelectionConnector');

/**
*@constructor
*WeaponSelectorContainer component
*/
LevelSelectorContainer = function() {
	this.arrSelectorData = [
		{x: 0 , y: 0, arrConnectorIndices:[0]},
		{x: Constants.UNIT * 3, y: 0, arrConnectorIndices:[1]},
		{x: Constants.UNIT * 6, y: 0, arrConnectorIndices:[2]},
		{x: Constants.UNIT * 9, y: 0, arrConnectorIndices:[3]},
		{x: Constants.UNIT * 12, y: 0, arrConnectorIndices:[4, 5]},

		{x: Constants.UNIT * 9, y: Constants.UNIT * 3, arrConnectorIndices:[6]},
		{x: Constants.UNIT * 6, y: Constants.UNIT * 6, arrConnectorIndices:[9]},
		{x: Constants.UNIT * 6, y: Constants.UNIT * 9, arrConnectorIndices:[12]},
		{x: Constants.UNIT * 6, y: Constants.UNIT * 12, arrConnectorIndices:null},

		{x: Constants.UNIT * 15, y: Constants.UNIT * 3, arrConnectorIndices:[7, 8]},
		{x: Constants.UNIT * 15, y: Constants.UNIT * 6, arrConnectorIndices:[10]},
		{x: Constants.UNIT * 15, y: Constants.UNIT * 9, arrConnectorIndices:[13]},
		{x: Constants.UNIT * 15, y: Constants.UNIT * 12, arrConnectorIndices:null},

		{x: Constants.UNIT * 18, y: Constants.UNIT * 6, arrConnectorIndices:[11]},
		{x: Constants.UNIT * 21, y: Constants.UNIT * 9, arrConnectorIndices:[14]},
		{x: Constants.UNIT * 24, y: Constants.UNIT * 12, arrConnectorIndices:null}
	];

	this.arrLevelSelectors = [];

	this.arrSelectionConnectorData = [
		{x: Constants.UNIT * 0.75, y: Constants.UNIT * 0.75, width: Constants.UNIT * 3, rotation: 0},
		{x: Constants.UNIT * 3.75, y: Constants.UNIT * 0.75, width: Constants.UNIT * 3, rotation: 0},
		{x: Constants.UNIT * 6.75, y: Constants.UNIT * 0.75, width: Constants.UNIT * 3, rotation: 0},
		{x: Constants.UNIT * 9.75, y: Constants.UNIT * 0.75, width: Constants.UNIT * 3, rotation: 0},

		{x: Constants.UNIT * 12.75, y: Constants.UNIT * 0.75, 
			width: Math.sqrt(Math.pow(Constants.UNIT * 3, 2) + Math.pow(Constants.UNIT * 3, 2)), rotation: 135},
		{x: Constants.UNIT * 12.75, y: Constants.UNIT * 0.75, 
			width: Math.sqrt(Math.pow(Constants.UNIT * 3, 2) + Math.pow(Constants.UNIT * 3, 2)), rotation: 45},

		{x: Constants.UNIT * 9.75, y: Constants.UNIT * 3.75, 
		 	width: Math.sqrt(Math.pow(Constants.UNIT * 3, 2) + Math.pow(Constants.UNIT * 3, 2)), rotation: 135},
		{x: Constants.UNIT * 15.75, y: Constants.UNIT * 3.75, width: Constants.UNIT * 3, rotation: 90},
		{x: Constants.UNIT * 15.75, y: Constants.UNIT * 3.75, 
		 	width: Math.sqrt(Math.pow(Constants.UNIT * 3, 2) + Math.pow(Constants.UNIT * 3, 2)), rotation: 45},

		{x: Constants.UNIT * 6.75, y: Constants.UNIT * 6.75, width: Constants.UNIT * 3, rotation: 90},
		{x: Constants.UNIT * 15.75, y: Constants.UNIT * 6.75, width: Constants.UNIT * 3, rotation: 90},
		{x: Constants.UNIT * 18.75, y: Constants.UNIT * 6.75, 
		 	width: Math.sqrt(Math.pow(Constants.UNIT * 3, 2) + Math.pow(Constants.UNIT * 3, 2)), rotation: 45},

		{x: Constants.UNIT * 6.75, y: Constants.UNIT * 9.75, width: Constants.UNIT * 3, rotation: 90},
		{x: Constants.UNIT * 15.75, y: Constants.UNIT * 9.75, width: Constants.UNIT * 3, rotation: 90},
		{x: Constants.UNIT * 21.75, y: Constants.UNIT * 9.75, 
		 	width: Math.sqrt(Math.pow(Constants.UNIT * 3, 2) + Math.pow(Constants.UNIT * 3, 2)), rotation: 45}
	];

	this.arrSelectionConnectors = [];

	/**
	*@type {Shape}
	*/
	this.container = null;

	/**
	*@type {Shape}
	*/
	this.background = null;

	this.currentLevelIndex = 0;

	this.offset = new app.b2Vec2(Constants.UNIT * 1.25, Constants.UNIT * 1.25);

	this.prevSelector = null;
	
	this.init();
};

/**
*@public
*/
LevelSelectorContainer.prototype.init = function() {
	var i = 0,
		selector,
		connector,
		data;

	this.container = new createjs.Container();

	this.background = new createjs.Shape();
	this.background.graphics
		.ss(1)
		.s(Constants.BLUE)
		.f(Constants.BLACK)
		.dr(0, 0, Constants.WIDTH - (Constants.UNIT * 2), Constants.HEIGHT - (Constants.UNIT * 2));
	this.background.alpha = 0.5;

	this.container.addChild(this.background);

	for(i = 0; i < this.arrSelectionConnectorData.length; i++) {
		data =  this.arrSelectionConnectorData[i];

		connector = new SelectionConnector(data.width, data.rotation);
		connector.container.x = data.x + this.offset.x;
		connector.container.y = data.y + this.offset.y;

		this.arrSelectionConnectors.push(connector);

		this.container.addChild(connector.container);
	}

	for(i = 0; i < this.arrSelectorData.length; i++) {
		data = this.arrSelectorData[i];

		selector = new LevelSelector("0x" + i.toString(16), data.arrConnectorIndices);
		selector.container.x = data.x + this.offset.x;
		selector.container.y = data.y + this.offset.y;

		this.arrLevelSelectors.push(selector);

		this.container.addChild(selector.container);
	}

	//set selectors and connectors to represent current level
	this.currentLevelIndex = app.levelProxy.getLevelIndex();

	for(i = 0; i < this.currentLevelIndex; i++) {
		this.setSelectionStateByIndex(i, LevelSelector.COMPLETE);
	}

	for(i = this.currentLevelIndex; i < this.arrLevelSelectors.length; i++) {
		this.setSelectionStateByIndex(i, LevelSelector.INCOMPLETE);
	}

	this.setSelectionStateByIndex(this.currentLevelIndex, LevelSelector.SELECTED);

	if(this.currentLevelIndex > 0) {
		this.prevSelector = this.arrLevelSelectors[this.currentLevelIndex - 1];

		if(this.prevSelector.arrConnectorIndices) {
			for(i = 0; i < this.prevSelector.arrConnectorIndices.length; i++) {
				this.arrSelectionConnectors[this.prevSelector.arrConnectorIndices[i]].setIsActive(true);
			}
		}
	}
};

/**
*@public
*/
LevelSelectorContainer.prototype.update = function() {
	var input = app.input;

	/*
	if(input.isUpOnce() || input.isLeftOnce()) {
		this.setSelectionStateByIndex(this.currentLevelIndex, LevelSelector.INCOMPLETE);

		this.currentLevelIndex--;

		if(this.currentLevelIndex < 0) {
			this.currentLevelIndex = this.arrLevelSelectors.length - 1;
		}

		this.setSelectionStateByIndex(this.currentLevelIndex, LevelSelector.SELECTED);
	} else if(input.isDownOnce() || input.isRightOnce()) {
		this.setSelectionStateByIndex(this.currentLevelIndex, LevelSelector.INCOMPLETE);

		this.currentLevelIndex++;

		if(this.currentLevelIndex >= this.arrLevelSelectors.length) {
			this.currentLevelIndex = 0;
		}

		this.setSelectionStateByIndex(this.currentLevelIndex, LevelSelector.SELECTED);
	}
	*/

	if(this.prevSelector && this.prevSelector.arrConnectorIndices) {
		for(i = 0; i < this.prevSelector.arrConnectorIndices.length; i++) {
			this.arrSelectionConnectors[this.prevSelector.arrConnectorIndices[i]].update();
		}
	}
}

/**
*@public
*/
LevelSelectorContainer.prototype.clear = function() {
	var i = 0;

	this.container.removeAllChildren();
	this.container = null;	

	this.background.graphics.clear();
	this.background = null;

	for(i = 0; i < this.arrLevelSelectors.length; i++) {
		this.arrLevelSelectors[i].clear();
		this.arrLevelSelectors[i] = null;
	}
	this.arrLevelSelectors = null;

	for(i = 0; i < this.arrSelectionConnectors.length; i++) {
		this.arrSelectionConnectors[i].clear();
		this.arrSelectionConnectors[i] = null;
	}
	this.arrSelectionConnectors = null;

	this.arrSelectorData = null
	this.arrSelectionConnectorData = null;
};

LevelSelectorContainer.prototype.setSelectionStateByIndex = function(index, state) {
	this.arrLevelSelectors[index].setState(state);
};

LevelSelectorContainer.prototype.setConnectorIsActiveByIndex = function(index, value) {
	this.arrSelectionConnectors[index].setIsActive(value);
};