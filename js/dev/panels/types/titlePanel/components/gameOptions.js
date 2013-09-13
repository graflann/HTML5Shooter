goog.provide('GameOptions');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('OptionText');
goog.require('GamepadCode');

/**
*@constructor
*Main GameOptions component in title screen
*/
GameOptions = function() {	
	/**
	*@type {createjs.Container}
	*/
	this.container = null;

	this.charWidth = 6;

	this.arrOptions = null;

	this.currentOptionIndex = 0;

	this.targetOptionIndex = 0;

	this.width = 0;
	this.height = 0;
	
	this.init();
};

goog.inherits(GameOptions, goog.events.EventTarget);

/**
*@public
*/
GameOptions.prototype.init = function() {
	this.container = new createjs.Container();

	this.setOptions();
};

/**
*@public
*/
GameOptions.prototype.update = function(options) {
	var input = app.input;

	if(input.isButtonPressedOnce(GamepadCode.BUTTONS.DPAD_UP)) {
		this.targetOptionIndex--;
		this.setSelection(this.targetOptionIndex);
	} else if(input.isButtonPressedOnce(GamepadCode.BUTTONS.DPAD_DOWN)) {
		this.targetOptionIndex++;
		this.setSelection(this.targetOptionIndex);
	}

	this.arrOptions[this.currentOptionIndex].update();
};

/**
*@public
*/
GameOptions.prototype.clear = function() {
	var optionText = null,
		i = 0;

	this.container.removeAllChildren();

	for(i; i < this.arrOptions.length; i++) {
		optionText = this.arrOptions[i];

		goog.events.unlisten(
			optionText, 
			EventNames.OPTION_SELECT, 
			this.onOptionSelect, 
			false, 
			this
		);

		optionText.clear();

		this.arrOptions[i] = null;
	}

	this.arrOptions.length = 0;
	this.arrOptions = null;

	this.container = null;
};

/**
*@private
*/
GameOptions.prototype.setOptions = function() {
	var optionText = null,
		prevOptionText = null,
		rowHeight = 0,
		i = 0,
		center = 0;

	this.arrOptions = [
		new OptionText("start", PanelTypes.PLAY_PANEL),
		new OptionText("options", PanelTypes.OPTIONS_PANEL)
	];

	this.width = this.arrOptions[0].width;

	//add the OptionText instances
	for(i = 0; i < this.arrOptions.length; i++) {
		optionText = this.arrOptions[i];

		this.container.addChild(optionText.text);

		if(i > 0) {
			prevOptionText = this.arrOptions[i - 1];

			optionText.text.y = prevOptionText.text.y + rowHeight;
		}

		rowHeight = optionText.height + 2;
		this.height += rowHeight;

		if(this.width < optionText.width) {
			this.width = optionText.width;
		}

		goog.events.listen(
			optionText, 
			EventNames.OPTION_SELECT, 
			this.onOptionSelect, 
			false, 
			this
		);
	}

	//center all OptionText instances relative to the container
	center = this.width * 0.5;
	for(i = 0; i < this.arrOptions.length; i++) {
		optionText = this.arrOptions[i];

		optionText.text.x = center - optionText.width;
	}

	//default to first selection
	this.arrOptions[0].setSelection(true);
};

GameOptions.prototype.setSelection = function(index) {
	var optionText = null,
		maxIndex = this.arrOptions.length - 1;

	//turn existing selection off
	this.arrOptions[this.currentOptionIndex].setSelection(false);

	//cap selectable index
	if(index > maxIndex) {
		index = 0;
	} else if(index < 0){
		index = maxIndex;
	}

	//acquire and turn on new selection
	this.currentOptionIndex = this.targetOptionIndex = index;

	optionText = this.arrOptions[this.currentOptionIndex];
	optionText.setSelection(true);
};

GameOptions.prototype.onOptionSelect = function(e) {
	goog.events.dispatchEvent(this, e);
};