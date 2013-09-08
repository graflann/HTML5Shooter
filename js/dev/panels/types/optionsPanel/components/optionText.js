goog.provide('OptionText');

/**
*@constructor
*OptionText component; highlight if user has focus
*/
OptionText = function(name) {	
	this.name = name.toString();

	this.text = null;

	this.charWidth = 6;

	this.width = 0;
	this.height = 0;

	isSelected = false;
	
	this.init();
};

/**
*@public
*/
OptionText.prototype.init = function() {
	this.text = new createjs.Text(this.name, "16px AXI_Fixed_Caps_5x5", Constants.DARK_BLUE);

	this.width = (this.name.length * this.charWidth);
	this.height = 16;
	
	this.setSelection(false);
};

/**
*@public
*/
OptionText.prototype.clear = function() {
	this.text = null;
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