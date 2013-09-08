goog.provide('OptionConfigurationRow');

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

	this.charWidth = 6;

	this.width = 0;
	this.height = 0;

	this.font = "16px AXI_Fixed_Caps_5x5";

	this.optionIndex = 0;

	isSelected = false;
	
	this.init();
};

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
};

/**
*@public
*/
OptionConfigurationRow.prototype.update = function() {
	var input = app.input;

	if(input.isButtonPressedOnce(GamepadCode.BUTTONS.DPAD_LEFT)) {
		this.optionIndex--;
		this.selectOption(this.optionIndex);
	} else if(input.isButtonPressedOnce(GamepadCode.BUTTONS.DPAD_RIGHT)) {
		this.optionIndex++;
		this.selectOption(this.optionIndex);
	}
};

/**
*@public
*/
OptionConfigurationRow.prototype.clear = function() {
	this.text = null;
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
OptionConfigurationRow.prototype.selectOption = function(index) {
	var maxIndex = this.arrOptionNames.length - 1;

	//cap selectable index
	if(index > maxIndex) {
		index = 0;
	} else if(index < 0){
		index = maxIndex;
	}

	//acquire and turn on new selection
	this.optionIndex = index;

	this.optionText.text = this.arrOptionNames[this.optionIndex];
};