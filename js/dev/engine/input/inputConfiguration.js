goog.provide('InputConfig');

goog.require('GamepadCode');

/**
*@enum {String}
*Map pad and key input to custom config; this is default
*/
InputConfig = {
	BUTTONS: {
		SHOOT: 			"shoot",
		SWITCH: 		"switch weapon",
		ROTATE_LEFT: 	"rotate left",
		ROTATE_RIGHT: 	"rotate right",
		HOMING: 		"homing",
		BOOST: 			"boost",
		RELOAD: 		"reload"
	}
}