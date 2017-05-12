goog.provide('Input');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('KeyCode');
goog.require('GamepadCode');
goog.require('MouseCode');
goog.require('InputConfig');

/**
*@constructor
*Handles key input
*/
Input = function() {
	this.config = [];

	/**
	*type {Array.<Boolean>}
	*/
	this.arrKeyDown = null;

	/**
	*type {Array.<Boolean>}
	*/
	this.arrPrevKeyDown = null;

	/**
	 * [arrPrevButtonDown description]
	 * @type {Array.<Boolean>}
	 */
	this.arrPrevButtonDown = null;

	/**
	 * @type {Array.<Boolean>}
	 */
	this.arrPrevAxesValues = null;

	this.arrMouseDown = null;

	this.arrPrevMouseDown = null;

	this.gamepad = null;

	// The canonical list of attached gamepads, without “holes” (always
	// starting at [0]) and unified between Firefox and Chrome.
	this.arrGamepads = [];

	//keeps track of total gamepads
	this.totalGamepads = 0;

	// Previous timestamps for gamepad state; used in Chrome to not bother with
	// analyzing the polled data if nothing changed (timestamp is the same as last time).
	this.prevTimestamps = [];

	this.currentState = "";

	this.gamepadSupportAvailable = false;

	this.gamePadSupportUnavailableEvent = new goog.events.Event(EventNames.GAMEPAD_SUPPORT_UNAVAILABLE, this);
	this.gamePadStatusChangedEvent = new goog.events.Event(EventNames.GAMEPAD_STATUS_CHANGED, this);

	this.init();
};

goog.inherits(Input, goog.events.EventTarget);

Input.STATES = {
	KEYBOARD_AND_MOUSE: "keyboardAndMouse",
	GAMEPAD: 			"gamepad"
};

Input.TYPICAL_BUTTON_COUNT = 16;

Input.MOVE_THRESHOLD = 0.5;
Input.SHOOT_THRESHOLD = 0.25;

/**
*@private
*/
Input.prototype.init = function() {
	this.setConfig();
	this.setKeyboard();
	this.setMouse();
	this.setGamepad();
	this.setState(Input.STATES.KEYBOARD_AND_MOUSE);
};

/**
*@public
*/
Input.prototype.setState = function(value) {
	this.currentState = value;
};

/**
*@public
*/
Input.prototype.getState = function() {
	return this.currentState;
};

/**
 * Sets the default input configuration; this can be reset in options
 * @return {[type]} [description]
 */
Input.prototype.setConfig = function() {

	this.config[InputConfig.BUTTONS.SHOOT] 			= GamepadCode.BUTTONS.A;
	this.config[InputConfig.BUTTONS.SWITCH] 		= GamepadCode.BUTTONS.X;
	this.config[InputConfig.BUTTONS.ROTATE_LEFT] 	= GamepadCode.BUTTONS.LB;
	this.config[InputConfig.BUTTONS.ROTATE_RIGHT] 	= GamepadCode.BUTTONS.RB;
	this.config[InputConfig.BUTTONS.HOMING] 		= GamepadCode.BUTTONS.Y;
	this.config[InputConfig.BUTTONS.BOOST] 			= GamepadCode.BUTTONS.RT;
	this.config[InputConfig.BUTTONS.RELOAD] 		= GamepadCode.BUTTONS.LT;

	console.log(this.config);
};

/**
 * [ description]
 * @return {[type]} [description]
 */
Input.prototype.setKeyboard = function() {
	var self = this,
		length = 256,
		i = length;

	this.arrKeyDown = new Array(length);
	this.arrPrevKeyDown = new Array(length);

	//init input Array instances
	while(i--) {
		this.arrPrevKeyDown[i] = this.arrKeyDown[i] = false;
	}
};

/**
 * [ description]
 * @return {[type]} [description]
 */
Input.prototype.setMouse = function() {
	this.arrMouseDown = [];
	this.arrPrevMouseDown = [];

	this.arrPrevMouseDown[MouseCode.BUTTONS.LEFT] = this.arrMouseDown[MouseCode.BUTTONS.LEFT] = false;
	this.arrPrevMouseDown[MouseCode.BUTTONS.MIDDLE] = this.arrMouseDown[MouseCode.BUTTONS.MIDDLE] = false;
	this.arrPrevMouseDown[MouseCode.BUTTONS.RIGHT] = this.arrMouseDown[MouseCode.BUTTONS.RIGHT] = false;
};

/**
 * Gamepad init;
 * Lifted from http://www.html5rocks.com/en/tutorials/doodles/gamepad/
 * @return {[type]} [description]
 */
Input.prototype.setGamepad = function() {
	var i = Input.TYPICAL_BUTTON_COUNT;

	this.gamepadSupportAvailable = "getGamepads" in navigator;

	console.log("Is gamepad support available? " + this.gamepadSupportAvailable.toString());

	this.arrPrevButtonDown = new Array(length);
	while(i--) {
		this.arrPrevButtonDown[i] = false;
	}

	this.arrPrevAxesValues = [];
	for(var key in GamepadCode.AXES) {
		this.arrPrevAxesValues[GamepadCode.AXES[key]] = 0;
		console.log("axis key: " + key + ", value: " + this.arrPrevAxesValues[GamepadCode.AXES[key]]);
	}

	if (this.gamepadSupportAvailable) {
		this.updateGamepads();
	}
};

// This function is called only on Chrome, which does not yet support connection/disconnection events,
// but requires you to monitor an array for changes.
Input.prototype.pollGamepads = function() {
	// Get the array of gamepads
	var rawGamepads = navigator.getGamepads(),
		gamepad = null;

	if (rawGamepads) {
		// We don’t want to use rawGamepads coming straight from the browser, since it can have “holes”
		// (e.g. if you plug two gamepads, and then unplug the first one, the remaining one will be at index [1]).
		this.arrGamepads.length = 0;

		for (var i = 0; i < rawGamepads.length; i++) {
			gamepad = rawGamepads[i];

			//ensure a defined and well-formed gamepad instance (sometimes unexpected devices qualify in rawGamepads)
			//by inspecting the button Array, a qualifying gamepad device can be validated
			if(gamepad && gamepad.buttons.length > 0) {
				this.arrGamepads.push(gamepad);
			}
		}

		//Notify listeners of change in gamepad connection status
		if (this.arrGamepads.length != this.totalGamepads) {
			this.gamePadStatusChangedEvent.payload = this.totalGamepads = this.arrGamepads.length;

			goog.events.dispatchEvent(this, this.gamePadStatusChangedEvent);
		}
	}
};

/**
*@public
*/
Input.prototype.validateGamepad = function() {
	this.pollGamepads();

	return this.gamepad;
};

/**
*@public
*/
Input.prototype.getGamepad = function() {
	return this.gamepad;
};

/**
*@public
*/
Input.prototype.getTotalGamepads = function() {
	return this.totalGamepads;
};

/**
* Checks for the gamepad status.
*/
Input.prototype.updateGamepads = function() {
	// Poll to see if gamepads are connected or disconnected. Necessary only on Chrome.
	this.pollGamepads();

	this.gamepad = this.arrGamepads[0];

	if(this.gamepad)
	{
		if (this.gamepad.timestamp && (this.gamepad.timestamp == this.prevTimestamps[0])) {
			return;
		}

		this.prevTimestamps[0] = this.gamepad.timestamp;
	}
};

/**
*@public
*@param 	Number
*@returns 	Boolean
*/
Input.prototype.isButtonDown = function(gamepadCode) {
	if(this.totalGamepads > 0) {

		var value = Boolean(this.gamepad.buttons[gamepadCode]);

		if(value) {
			this.setState(Input.STATES.GAMEPAD);
		}

		return value;
	}

	return false;
};

/**
*@public
*@param 	Number
*@returns 	Boolean
*/
Input.prototype.isPrevButtonDown = function(gamepadCode) {
	return this.arrPrevButtonDown[gamepadCode];
};

/**
 * @public
 * @param	Array
 */
Input.prototype.checkPrevButtonDown = function(arrGamepadCodes) {
	if(this.totalGamepads > 0) {
		var i = arrGamepadCodes.length,
			gamepadCode;

		while(i--) {
			gamepadCode = arrGamepadCodes[i];
			this.arrPrevButtonDown[gamepadCode] = this.isButtonDown(gamepadCode);
		}
	}
}

/**
 * @public
 * @param	Number
 * @returns Boolean
 */
Input.prototype.isButtonPressedOnce = function(gamepadCode) {
	var value = this.isButtonDown(gamepadCode) && !this.isPrevButtonDown(gamepadCode);

	if(value) {
		this.setState(Input.STATES.GAMEPAD);
	}

	return value;
};

/**
*@public
*@param 	Number
*@returns 	Boolean
*/
Input.prototype.getAxis = function(gamepadCode) {
	if(this.totalGamepads > 0) {
		return this.gamepad.axes[gamepadCode];
	}

	return 0;
};

/**
*@public
*@param 	Number
*@returns 	Boolean
*/
Input.prototype.isButtonDown = function(gamepadCode) {
	if(this.totalGamepads > 0) {
		var button = this.gamepad.buttons[gamepadCode],
			value = button.pressed || button.value > 0;

		if(value) {
			this.setState(Input.STATES.GAMEPAD);
		}

		return value;
	}

	return false;
};

/**
*@private
*@param 	e
*@returns 	Boolean
*/
Input.prototype.isLeftVertUpOnce = function() {
	if(this.totalGamepads > 0) {
		var vert = this.getAxis(GamepadCode.AXES.LEFT_STICK_VERT),
			prevVert = this.arrPrevAxesValues[GamepadCode.AXES.LEFT_STICK_VERT],
			value = (vert < -Input.MOVE_THRESHOLD && prevVert != Math.round(vert));

		if(value) {
			this.setState(Input.STATES.GAMEPAD);
		}

		return value;
	}

	return false;
};

/**
*@private
*@param 	e
*@returns 	Boolean
*/
Input.prototype.isLeftVertDownOnce = function() {
	if(this.totalGamepads > 0) {
		var vert = this.getAxis(GamepadCode.AXES.LEFT_STICK_VERT),
			prevVert = this.arrPrevAxesValues[GamepadCode.AXES.LEFT_STICK_VERT],
			value = (vert > Input.MOVE_THRESHOLD && prevVert != Math.round(vert));

		if(value) {
			this.setState(Input.STATES.GAMEPAD);
		}

		return value;
	}

	return false;
};

/**
*@private
*@param 	e
*@returns 	Boolean
*/
Input.prototype.isLeftHoriLeftOnce = function() {
	if(this.totalGamepads > 0) {
		var hori = this.getAxis(GamepadCode.AXES.LEFT_STICK_HOR),
			prevVert = this.arrPrevAxesValues[GamepadCode.AXES.LEFT_STICK_HOR],
			value = (hori < -Input.MOVE_THRESHOLD && prevHori != Math.round(hori));

		if(value) {
			this.setState(Input.STATES.GAMEPAD);
		}

		return value;
	}

	return false;
};

/**
*@private
*@param 	e
*@returns 	Boolean
*/
Input.prototype.isLeftHoriRightOnce = function() {
	if(this.totalGamepads > 0) {
		var hori = this.getAxis(GamepadCode.AXES.LEFT_STICK_HOR),
			prevHori = this.arrPrevAxesValues[GamepadCode.AXES.LEFT_STICK_HOR],
			value = (hori > Input.MOVE_THRESHOLD && prevHori != Math.round(hori));

		if(value) {
			this.setState(Input.STATES.GAMEPAD);
		}

		return value;
	}

	return false;
};

/**
 * @public
 * @param	arrKeyCodes
 */
Input.prototype.checkPrevAxesValues = function() {
	if(this.totalGamepads > 0) {
		var axisValue = null;

		for(var key in GamepadCode.AXES) {
			axisValue = GamepadCode.AXES[key];

			this.arrPrevAxesValues[axisValue] = Math.round(this.getAxis(axisValue));
		}
	}
}

/**
*@public
*@param 	Number
*@returns 	Boolean
*/
Input.prototype.isKeyDown = function(keyCode) {
	return this.arrKeyDown[keyCode];
};

/**
*@public
*@param 	Number
*@returns 	Boolean
*/
Input.prototype.isPrevKeyDown = function(keyCode) {
	return this.arrPrevKeyDown[keyCode];
};

/**
 * @public
 * @param	arrKeyCodes
 */
Input.prototype.checkPrevKeyDown = function(arrKeyCodes) {
	var i = arrKeyCodes.length,
		keyCode;

	while(i--) {
		keyCode = arrKeyCodes[i];
		this.arrPrevKeyDown[keyCode] = this.arrKeyDown[keyCode];
	}
}

/**
 * @public
 * @param	arrKeyCodes
 */
Input.prototype.isKeyPressedOnce = function(keyCode) {
	return this.isKeyDown(keyCode) && !this.isPrevKeyDown(keyCode);
}

/**
*@private
*@param 	e
*@returns 	Boolean
*/
Input.prototype.isMouseButtonDown = function(mouseCode) {
	return this.arrMouseDown[mouseCode];
};

/**
*@private
*@param 	e
*@returns 	Boolean
*/
Input.prototype.isPrevMouseButtonDown = function(mouseCode) {
	return this.arrPrevMouseDown[mouseCode];
};

/**
 * @public
 * @param	arrMouseCodes
 */
Input.prototype.checkPrevMouseDown = function(arrMouseCodes) {
	var i = arrMouseCodes.length,
		mouseCode;

	while(i--) {
		mouseCode = arrMouseCodes[i];
		this.arrPrevMouseDown[mouseCode] = this.arrMouseDown[mouseCode];
	}
}

/**
 * @public
 * @param	arrKeyCodes
 */
Input.prototype.isMouseButtonPressedOnce = function(mouseCode) {
	return this.isMouseButtonDown(mouseCode) && !this.isPrevMouseButtonDown(mouseCode);
}

//KEY HANDLERS
/**
*@private
*@param 	e
*@returns 	Boolean
*/
Input.prototype.onKeyDown = function(e) {
	this.arrKeyDown[e.keyCode] = true;
};

/**
*@private
*@param 	e
*@returns 	Boolean
*/
Input.prototype.onKeyUp = function(e) {
	this.arrKeyDown[e.keyCode] = false;
};

//Convenience wrappers
Input.prototype.isConfirming = function() {
	return (
		this.isButtonPressedOnce(GamepadCode.BUTTONS.START) ||
		this.isButtonPressedOnce(GamepadCode.BUTTONS.A) ||
		this.isKeyPressedOnce(KeyCode.SPACE) ||
		this.isKeyPressedOnce(KeyCode.ENTER)
	);
}

Input.prototype.isExiting = function() {
	return (
		this.isButtonPressedOnce(GamepadCode.BUTTONS.BACK) ||
		this.isButtonPressedOnce(GamepadCode.BUTTONS.B) ||
		this.isKeyPressedOnce(KeyCode.ESCAPE) ||
		this.isKeyPressedOnce(KeyCode.BACKSPACE)
	);
}

Input.prototype.isUp = function() {
	var value = (
			this.isButtonDown(GamepadCode.BUTTONS.DPAD_UP) ||
			this.isKeyDown(KeyCode.W) ||
			this.isKeyDown(KeyCode.UP)
		),
		axisValue = (this.getAxis(GamepadCode.AXES.LEFT_STICK_VERT) < -Input.MOVE_THRESHOLD);

	if(axisValue) {
		this.setState(Input.STATES.GAMEPAD);
	}

	return value || axisValue;
}

Input.prototype.isUpOmitDpad = function() {
	var value = (
			this.isKeyDown(KeyCode.W) ||
			this.isKeyDown(KeyCode.UP)
		),
		axisValue = (this.getAxis(GamepadCode.AXES.LEFT_STICK_VERT) < -Input.MOVE_THRESHOLD);

	if(axisValue) {
		this.setState(Input.STATES.GAMEPAD);
	}

	return value || axisValue;
}

Input.prototype.isDown = function() {
	var value = (
			this.isButtonDown(GamepadCode.BUTTONS.DPAD_DOWN) ||
			this.isKeyDown(KeyCode.S) ||
			this.isKeyDown(KeyCode.DOWN)
		),
		axisValue = (this.getAxis(GamepadCode.AXES.LEFT_STICK_VERT) > Input.MOVE_THRESHOLD);

	if(axisValue) {
		this.setState(Input.STATES.GAMEPAD);
	}

	return value || axisValue;
}

Input.prototype.isDownOmitDpad = function() {
	var value = (
			this.isKeyDown(KeyCode.S) ||
			this.isKeyDown(KeyCode.DOWN)
		),
		axisValue = (this.getAxis(GamepadCode.AXES.LEFT_STICK_VERT) > Input.MOVE_THRESHOLD);

	if(axisValue) {
		this.setState(Input.STATES.GAMEPAD);
	}

	return value || axisValue;
}

Input.prototype.isLeft = function() {
	var value = (
			this.isButtonDown(GamepadCode.BUTTONS.DPAD_LEFT) ||
			this.isKeyDown(KeyCode.A) ||
			this.isKeyDown(KeyCode.LEFT)
		),
		axisValue = (this.getAxis(GamepadCode.AXES.LEFT_STICK_HOR) < -Input.MOVE_THRESHOLD);

	if(axisValue) {
		this.setState(Input.STATES.GAMEPAD);
	}

	return value || axisValue;
}

Input.prototype.isLeftOmitDpad = function() {
	var value = (
			this.isKeyDown(KeyCode.A) ||
			this.isKeyDown(KeyCode.LEFT)
		),
		axisValue = (this.getAxis(GamepadCode.AXES.LEFT_STICK_HOR) < -Input.MOVE_THRESHOLD);

	if(axisValue) {
		this.setState(Input.STATES.GAMEPAD);
	}

	return value || axisValue;
}

Input.prototype.isRight = function() {
	var value = (
			this.isButtonDown(GamepadCode.BUTTONS.DPAD_RIGHT) ||
			this.isKeyDown(KeyCode.D) ||
			this.isKeyDown(KeyCode.RIGHT)
		),
		axisValue = (this.getAxis(GamepadCode.AXES.LEFT_STICK_HOR) > Input.MOVE_THRESHOLD);

	if(axisValue) {
		this.setState(Input.STATES.GAMEPAD);
	}

	return value || axisValue;
}

Input.prototype.isRightOmitDpad = function() {
	var value = (
			this.isKeyDown(KeyCode.D) ||
			this.isKeyDown(KeyCode.RIGHT)
		),
		axisValue = (this.getAxis(GamepadCode.AXES.LEFT_STICK_HOR) > Input.MOVE_THRESHOLD);

	if(axisValue) {
		this.setState(Input.STATES.GAMEPAD);
	}

	return value || axisValue;
}

Input.prototype.isUpOnce = function() {
	return (
		this.isButtonPressedOnce(GamepadCode.BUTTONS.DPAD_UP) ||
		this.isLeftVertUpOnce() ||
		this.isKeyPressedOnce(KeyCode.W) ||
		this.isKeyPressedOnce(KeyCode.UP)
	);
}

Input.prototype.isDownOnce = function() {
	return (
		this.isButtonPressedOnce(GamepadCode.BUTTONS.DPAD_DOWN) ||
		this.isLeftVertDownOnce() ||
		this.isKeyPressedOnce(KeyCode.S) ||
		this.isKeyPressedOnce(KeyCode.DOWN)
	);
}

Input.prototype.isLeftOnce = function() {
	return (
		this.isButtonPressedOnce(GamepadCode.BUTTONS.DPAD_LEFT) ||
		this.isLeftHoriLeftOnce() ||
		this.isKeyPressedOnce(KeyCode.A) ||
		this.isKeyPressedOnce(KeyCode.LEFT)
	);
}

Input.prototype.isRightOnce = function() {
	return (
		this.isButtonPressedOnce(GamepadCode.BUTTONS.DPAD_RIGHT) ||
		this.isLeftHoriRightOnce() ||
		this.isKeyPressedOnce(KeyCode.D) ||
		this.isKeyPressedOnce(KeyCode.RIGHT)
	);
}
