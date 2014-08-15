goog.provide('LevelSelector');

/**
*@constructor
*LevelSelector component
*/
LevelSelector = function(name, arrConnectorIndices) {	
	this.name = name.toString();

	this.arrConnectorIndices = arrConnectorIndices || null;

	/**
	*@type {createjs.Container}
	*/
	this.container = null;

	/**
	*@type {createjs.Shape}
	*/
	this.background = null;

	this.text = null;

	this.width = 0;
	this.height = 0;

	this.state = "";
	
	this.init();
};

LevelSelector.COMPLETE 		= "complete";
LevelSelector.INCOMPLETE 	= "incomplete";
LevelSelector.SELECTED 		= "selected";

/**
*@public
*/
LevelSelector.prototype.init = function() {
	this.container = new createjs.Container();

	this.width = (Constants.UNIT * 1.5);
	this.height = (Constants.UNIT * 1.5);

	this.background = new createjs.Shape();

	this.text = new createjs.Text(this.name, "16px AXI_Fixed_Caps_5x5", Constants.DARK_BLUE);
	this.text.x = (this.width * 0.5) - (this.name.length * app.charWidth) + 1;
	this.text.y = (this.height * 0.5) - 7;
	//this.text.scaleX = this.text.scaleY = 2;

	this.container.addChild(this.background);
	this.container.addChild(this.text);
	
	this.setState(LevelSelector.INCOMPLETE);
};

/**
*@public
*/
LevelSelector.prototype.clear = function() {
	this.container.removeAllChildren();
	this.container = null;

	this.background.graphics.clear();
	this.background = null;

	this.text = null;
};

/**
*@public
*/
LevelSelector.prototype.setState = function(value) {
	this.state = value;

	switch(this.state)
	{
	case LevelSelector.COMPLETE:
		this.background.graphics
			.ss(1)
			.s(Constants.LIGHT_BLUE)
			.lf([Constants.DARK_BLUE, Constants.BLUE], [0.75, 1], 0, 0, this.width, 0)
			.dr(0, 0, this.width, this.height);

		this.text.color = Constants.BLUE;
		break;
	case LevelSelector.INCOMPLETE:
		this.background.graphics
			.ss(1)
			.s(Constants.YELLOW)
			.lf([Constants.DARK_RED, Constants.RED], [0.75, 1], 0, 0, this.width, 0)
			.dr(0, 0, this.width, this.height);

		this.text.color = Constants.RED;
		break;
	case LevelSelector.SELECTED:
		this.background.graphics
			.ss(1)
			.s(Constants.DARK_BLUE)
			.lf([Constants.LIGHT_BLUE, Constants.BLUE], [0, 1], 0, 0, this.width, 0)
			.dr(0, 0, this.width, this.height);

		this.text.color = Constants.BLACK;
		break;
	}
};

/**
*@public
*/
LevelSelector.prototype.getArrConnectorIndices = function() {
	return this.arrConnectorIndices;
};