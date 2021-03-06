goog.provide('OptionConfigurationRow');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');

/**
*@constructor
*OptionText component; highlight if user has focus
*/
OptionConfigurationRow = function(selectionName, arrOptionNames) {	
	this.selectionName = selectionName.toString();

	this.arrOptionNames = arrOptionNames;

	/**
	*@type {createjs.Container}
	*/
	this.container = null;

	/**
	*@type {createjs.Shape}
	*/
	this.background = null;

	this.selectionText = null;

	this.optionText = null;

	this.leftArrow = null;
	this.rightArrow = null;

	this.width = 0;
	this.height = 0;

	this.font = "16px AXI_Fixed_Caps_5x5";

	this.optionIndex = 0;

	this.prevOptionIndex = this.optionIndex;

	isSelected = false;

	this.optionSelectedEvent = new goog.events.Event(EventNames.OPTION_SELECT, this);
	
	this.init();
};

goog.inherits(OptionConfigurationRow, goog.events.EventTarget);

/**
*@public
*/
OptionConfigurationRow.prototype.init = function() {
	this.container = new createjs.Container();

	this.width = Constants.WIDTH * 0.75;
	this.height = 20;

	this.background = new createjs.Shape();

	this.selectionText = new createjs.Text(
		this.selectionName, 
		this.font, 
		Constants.DARK_BLUE
	);
	this.selectionText.x = 2;
	this.selectionText.y = 3;

	this.optionText = new createjs.Text(
		this.arrOptionNames[this.currentOptionIndex], 
		this.font, 
		Constants.DARK_BLUE
	);
	this.optionText.x = this.width * 0.6;
	this.optionText.y = 3;

	this.leftArrow = new createjs.Text(
		"<", 
		this.font, 
		Constants.DARK_BLUE
	);
	this.leftArrow.x = this.optionText.x - 16;
	this.leftArrow.y = 3;

	this.rightArrow = new createjs.Text(
		">", 
		this.font, 
		Constants.DARK_BLUE
	);
	this.rightArrow.x = this.width - 16;
	this.rightArrow.y = 3;
	
	this.container.addChild(this.background);
	this.container.addChild(this.selectionText);
	this.container.addChild(this.optionText);
	this.container.addChild(this.leftArrow);
	this.container.addChild(this.rightArrow);
	
	this.setSelection(false);
	this.selectOption(0);
};

/**
*@public
*/
OptionConfigurationRow.prototype.update = function() {
	var input = app.input;

	if(input.isLeftOnce()) {
		this.optionIndex--;
		this.selectOption(this.optionIndex, true);
	} else if(input.isRightOnce()) {
		this.optionIndex++;
		this.selectOption(this.optionIndex, true);
	}
};

/**
*@public
*/
OptionConfigurationRow.prototype.clear = function() {
	this.container.removeAllChildren();

	this.arrOptionNames.length = 0;
	this.arrOptionNames = null;

	this.optionSelectedEvent = null;

	this.optionText = null;
	this.selectionText = null;
	this.leftArrow = null;
	this.rightArrow = null;
	this.container = null;
};

/**
*@public
*/
OptionConfigurationRow.prototype.getSelection = function() {
	return this.selectionText.text;
};

/**
*@public
*/
OptionConfigurationRow.prototype.getOption = function() {
	return this.optionText.text;
};

/**
*@public
*/
OptionConfigurationRow.prototype.setSelection = function(value) {
	this.isSelected = value;

	if(this.isSelected) {
		this.background.graphics
			.ss(1)
			.s(Constants.DARK_BLUE)
			.lf([Constants.LIGHT_BLUE, Constants.BLUE], [0, 1], 0, 0, this.width, 0)
			.dr(0, 0, this.width, this.height);

		this.selectionText.color = this.optionText.color = Constants.BLACK;
	} else {
		this.background.graphics
			.ss(1)
			.s(Constants.LIGHT_BLUE)
			.lf([Constants.DARK_BLUE, Constants.BLUE], [0.9, 1], 0, 0, this.width, 0)
			.dr(0, 0, this.width, this.height);

		this.selectionText.color = this.optionText.color = Constants.BLUE;
	}

	this.leftArrow.visible = this.rightArrow.visible = this.isSelected;
};

/**
*@public
*/
OptionConfigurationRow.prototype.selectOption = function(index, isDispatching) {
	var maxIndex = this.arrOptionNames.length - 1,
		isDispatching = isDispatching || false;

	//cap selectable index
	if(index > maxIndex) {
		index = 0;
	} else if(index < 0){
		index = maxIndex;
	}

	this.optionIndex = index;

	//update option text
	this.optionText.text = this.arrOptionNames[this.optionIndex];

	//noficiation of option change
	if(isDispatching) {
		goog.events.dispatchEvent(this, this.optionSelectedEvent);
	}

	this.prevOptionIndex = this.optionIndex;
};