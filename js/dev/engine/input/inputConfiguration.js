goog.provide('InputConfiguration');

goog.require('GamepadCode');

/**
*@enum {String}
*Map pad and key input to custom config; this is default
*/
InputConfiguration = {
	DEFAULT: {
		SHOOT: { 
	    	name: "shoot",
	    	button: GamepadCode.BUTTONS.A
	    },
	    SWITCH: { 
	    	name: "switch weapon",
	    	button: GamepadCode.BUTTONS.X
	    },
	    ROTATE_LEFT: { 
	    	name: "rotate left",
	    	button: GamepadCode.BUTTONS.LB
	    },
	    ROTATE_RIGHT: { 
	    	name: "rotate right",
	    	button: GamepadCode.BUTTONS.RB
	    },
	    HOMING: { 
	    	name: "homing",
	    	button: GamepadCode.BUTTONS.Y
	    }
	},
	CUSTOM: {

	}
};