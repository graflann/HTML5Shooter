goog.provide('OptionText');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');

/**
*@constructor
*OptionText component; highlight if user has focus
*/
OptionText = function(name, panelKey) {	
	this.name = name.toString();

	this.panelKey = panelKey;

	this.text = null;

	this.charWidth = 6;

	this.width = 0;
	this.height = 0;

	this.isSelected = false;

	this.optionSelectedEvent = new goog.events.Event(EventNames.OPTION_SELECT, this);
	
	this.init();
};

goog.inherits(OptionText, goog.events.EventTarget);

/**
*@public
*/
OptionText.prototype.init = function() {
	this.text = new createjs.Text(this.name, "16px AXI_Fixed_Caps_5x5", Constants.DARK_BLUE);

	this.width = (this.name.length * app.charWidth);
	this.height = 16;
	
	this.setSelection(false);
};

/**
*@public
*/
OptionText.prototype.update = function() {
	var input = app.input;

	if(input.isButtonPressedOnce(GamepadCode.BUTTONS.START) || 
		input.isButtonPressedOnce(GamepadCode.BUTTONS.A)) {
		goog.events.dispatchEvent(this, this.optionSelectedEvent);
	}
};

/**
*@public
*/
OptionText.prototype.clear = function() {
	this.text = null;

	this.optionSelectedEvent = null;
};

/**
*@public
*/
OptionText.prototype.setSelection = function(value) {
	this.isSelected = value;

	if(this.isSelected) {
		this.text.color = Constants.LIGHT_BLUE;
	} else {
		this.text.color = Constants.BLUE;
	}
};