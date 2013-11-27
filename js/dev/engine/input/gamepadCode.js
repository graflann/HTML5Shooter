goog.provide('GamepadCode');

/**
*Mapped to Xbox 360 controller defaults
*@enum {number}
*/
GamePadCode = {
	BUTTONS: {
		// Face (main) buttons
		A: 0, 
		B: 1,
		X: 2,
		Y: 3,

		// Top shoulder buttons
		LB: 4, 
		RB: 5,

		// Bottom shoulder buttons or triggers
		LT: 6, 
		RT: 7,

		// Utility buttons
		BACK: 8,
		START: 9,

		// Analog stick buttons (if depressible)
		L3: 10, 
		R3: 11,

		// Directional pad
		DPAD_UP: 12, 
		DPAD_DOWN: 13,
		DPAD_LEFT: 14,
		DPAD_RIGHT: 15
	},

	//Analogue sticks
	AXES: {
		LEFT_STICK_HOR: 0,
		LEFT_STICK_VERT: 1,
		RIGHT_STICK_HOR: 2,
		RIGHT_STICK_VERT: 3
	}
};

goog.exportSymbol('GamepadCode', GamePadCode);