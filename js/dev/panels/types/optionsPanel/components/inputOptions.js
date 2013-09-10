goog.provide('InputOptions');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('InputConfig');
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

	this.arrOptionRows = null;

	this.currentRowIndex = 0;

	this.targetRowIndex = 0;

	this.width = 0;
	this.height = 0;
	
	this.init();
};

goog.inherits(InputOptions, goog.events.EventTarget);

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
	var optionRow = null,
		i = 0;

	this.container.removeAllChildren();

	for(i; i < this.arrOptionRows.length; i++) {
		optionRow = this.arrOptionRows[i];

		goog.events.unlisten(
			optionRow, 
			EventNames.OPTION_SELECT, 
			this.onOptionSelect, 
			false, 
			this
		);

		optionRow.clear();

		this.arrOptionRows[i] = null;
	}

	this.arrOptionRows.length = 0;
	this.arrOptionRows = null;

	this.container = null;
};

/**
*@private
*/
InputOptions.prototype.setOptions = function() {
	var optionRow = null,
		prevOptionRow = null,
		rowHeight = 0,
		i = 0,
		arrOptions = [ 
			"",
			InputConfig.BUTTONS.SHOOT,
			InputConfig.BUTTONS.SWITCH,
			InputConfig.BUTTONS.ROTATE_LEFT,
			InputConfig.BUTTONS.ROTATE_RIGHT,
			InputConfig.BUTTONS.HOMING
		];

	this.arrOptionRows = [
		new OptionConfigurationRow("A", arrOptions),
		new OptionConfigurationRow("B", arrOptions),
		new OptionConfigurationRow("X", arrOptions),
		new OptionConfigurationRow("Y", arrOptions),
		new OptionConfigurationRow("LB", arrOptions),
		new OptionConfigurationRow("RB", arrOptions),
		new OptionConfigurationRow("LT", arrOptions),
		new OptionConfigurationRow("RT", arrOptions),
		new OptionConfigurationRow("L3", arrOptions),
		new OptionConfigurationRow("R3", arrOptions)
	];

	this.width = this.arrOptionRows[0].width;

	for(i; i < this.arrOptionRows.length; i++) {
		optionRow = this.arrOptionRows[i];

		this.container.addChild(optionRow.container);

		if(i > 0) {
			prevOptionRow = this.arrOptionRows[i - 1];

			optionRow.container.y = prevOptionRow.container.y + rowHeight;
		}

		rowHeight = optionRow.height + 2;
		this.height += rowHeight;

		goog.events.listen(
			optionRow, 
			EventNames.OPTION_SELECT, 
			this.onOptionSelect, 
			false, 
			this
		);
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

InputOptions.prototype.onOptionSelect = function(e) {
	var targetRow = e.target,
		optionRow = null,
		targetText = targetRow.getOption(),
		optionText = "",
		length = this.arrOptionRows.length,
		i = 0;

	// console.log(
	// 	"Selection: " + targetRow.getSelection() +
	// 	", Option: " + targetRow.getOption() + 
	// 	", Option Index: " + targetRow.optionIndex + 
	// 	", Prev Option Index: " + targetRow.prevOptionIndex
	// );

	for(i; i < length; i++) {
		optionRow = this.arrOptionRows[i];

		if(optionRow !== targetRow) {
			optionText = optionRow.getOption();

			//swap options with a different row upon option change
			if(optionText === targetText) {
				optionRow.selectOption(targetRow.prevOptionIndex);

				//reset option text to new option selection
				optionText = optionRow.getOption();

				//change input config map to point to new button assignments
				if(targetText !== "") {
					app.input.config[targetText] = GamepadCode.BUTTONS[targetRow.getSelection()];
				}

				if(optionText !== "") {
					app.input.config[optionText] = GamepadCode.BUTTONS[optionRow.getSelection()];
				}

				console.log(app.input.config);
				
				return;
			}
		}
	}
};