goog.provide('GamepadCode');

/**
*Mapped to Xbox 360 controller defaults
*@enum {number}
*/
GamePadCode = {
	BUTTONS: {
	  A: 0, // Face (main) buttons
	  B: 1,
	  X: 2,
	  Y: 3,

	  LB: 4, // Top shoulder buttons
	  RB: 5,

	  LT: 6, // Bottom shoulder buttons or triggers
	  RT: 7,

	  BACK: 8,
	  START: 9,

	  L3: 10, // Analog stick buttons (if depressible)
	  R3: 11,
	  
	  DPAD_UP: 12, // Directional pad
	  DPAD_DOWN: 13,
	  DPAD_LEFT: 14,
	  DPAD_RIGHT: 15
	},

	AXES: {
	  LEFT_STICK_HOR: 0,
	  LEFT_STICK_VERT: 1,
	  RIGHT_STICK_HOR: 2,
	  RIGHT_STICK_VERT: 3
	}
};

goog.exportSymbol('GamepadCode', GamePadCode);