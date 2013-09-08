goog.provide('InputOptions');

goog.require('OptionConfigurationRow');
goog.require('OptionText');
goog.require('GamepadCode');

/**
*@constructor
*InputOptions component
*/
InputOptions = function() {	
	/**
	*@type {createjs.Container}
	*/
	this.container = null;

	this.charWidth = 6;

	this.arrOptionRows = [];

	this.currentRowIndex = 0;

	this.targetRowIndex = 0;
	
	this.init();
};

/**
*@public
*/
InputOptions.prototype.init = function() {
	this.container = new createjs.Container();

	this.setOptions();
};

/**
*@public
*/
InputOptions.prototype.update = function(options) {
	var input = app.input;

	if(input.isButtonPressedOnce(GamepadCode.BUTTONS.DPAD_UP)) {
		this.targetRowIndex--;
		this.setSelection(this.targetRowIndex);
	} else if(input.isButtonPressedOnce(GamepadCode.BUTTONS.DPAD_DOWN)) {
		this.targetRowIndex++;
		this.setSelection(this.targetRowIndex);
	}

	this.arrOptionRows[this.currentRowIndex].update();
};

/**
*@public
*/
InputOptions.prototype.clear = function() {
	
};

/**
*@private
*/
InputOptions.prototype.setOptions = function() {
	var optionRow = null,
		prevOptionRow = null,
		i = 0,
		arrOptions = [ 
			"",
			InputConfiguration.DEFAULT.SHOOT.name,
			InputConfiguration.DEFAULT.SWITCH.name,
			InputConfiguration.DEFAULT.ROTATE_LEFT.name,
			InputConfiguration.DEFAULT.ROTATE_RIGHT.name,
			InputConfiguration.DEFAULT.HOMING.name
		];

	this.arrOptionRows.push(new OptionConfigurationRow("A", arrOptions));
	this.arrOptionRows.push(new OptionConfigurationRow("B", arrOptions));
	this.arrOptionRows.push(new OptionConfigurationRow("X", arrOptions));
	this.arrOptionRows.push(new OptionConfigurationRow("Y", arrOptions));
	this.arrOptionRows.push(new OptionConfigurationRow("LB", arrOptions));
	this.arrOptionRows.push(new OptionConfigurationRow("RB", arrOptions));
	this.arrOptionRows.push(new OptionConfigurationRow("LT", arrOptions));
	this.arrOptionRows.push(new OptionConfigurationRow("RT", arrOptions));
	this.arrOptionRows.push(new OptionConfigurationRow("L3", arrOptions));
	this.arrOptionRows.push(new OptionConfigurationRow("R3", arrOptions));

	for(i; i < this.arrOptionRows.length; i++) {
		optionRow = this.arrOptionRows[i];

		this.container.addChild(optionRow.container);

		if(i > 0) {
			prevOptionRow = this.arrOptionRows[i - 1];
			optionRow.container.y = prevOptionRow.container.y + prevOptionRow.height + 2;
		}
	}

	//default to first selection
	this.arrOptionRows[0].setSelection(true);

	//set option defaults
	this.arrOptionRows[0].selectOption(1);
	this.arrOptionRows[2].selectOption(2);
	this.arrOptionRows[3].selectOption(5);
	this.arrOptionRows[4].selectOption(3);
	this.arrOptionRows[5].selectOption(4);
};

InputOptions.prototype.setSelection = function(index) {
	var optionRow = null,
		maxIndex = this.arrOptionRows.length - 1;

	//turn existing selection off
	this.arrOptionRows[this.currentRowIndex].setSelection(false);

	//cap selectable index
	if(index > maxIndex) {
		index = 0;
	} else if(index < 0){
		index = maxIndex;
	}

	//acquire and turn on new selection
	this.currentRowIndex = this.targetRowIndex = index;

	optionRow = this.arrOptionRows[this.currentRowIndex];
	optionRow.setSelection(true);
};