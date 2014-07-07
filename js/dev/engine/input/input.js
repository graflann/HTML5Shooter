goog.provide('Input');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('KeyCode');
goog.require('GamepadCode');
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

	/**
	 * 
	 */
	this.gamepad = null;

	// The canonical list of attached gamepads, without “holes” (always
	// starting at [0]) and unified between Firefox and Chrome.
	this.arrGamepads = [];

	//keeps track of total gamepads
	this.totalGamepads = 0;

	// Whether we’re requestAnimationFrameing like it’s 1999.
	this.isTicking = false;

	// Previous timestamps for gamepad state; used in Chrome to not bother with
	// analyzing the polled data if nothing changed (timestamp is the same as last time).
	this.prevTimestamps = [];

	this.gamepadSupportAvailable = false;

	this.gamePadSupportUnavailableEvent = new goog.events.Event(EventNames.GAMEPAD_SUPPORT_UNAVAILABLE, this);
	this.gamePadStatusChangedEvent = new goog.events.Event(EventNames.GAMEPAD_STATUS_CHANGED, this);
	
	this.init();
};

goog.inherits(Input, goog.events.EventTarget);

Input.TYPICAL_BUTTON_COUNT = 16;

Input.MOVE_THRESHOLD = 0.5;
Input.SHOOT_THRESHOLD = 0.25;

/**
*@private
*/
Input.prototype.init = function() {
	this.setConfig();
	this.setKeyboard();
	this.setGamepad();
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
		stageSelector = app.layers.getSelector(LayerTypes.INPUT),
		length = 256,
		i = length;
	
	this.arrKeyDown = new Array(length);
	this.arrPrevKeyDown = new Array(length);
	
	//init input Array instances
	while(i--) {
		this.arrPrevKeyDown[i] = this.arrKeyDown[i] = false;
	}

	stageSelector.keydown(function(e) { self.onKeyDown(e); });
	stageSelector.keyup(function(e) { self.onKeyUp(e); });
};

/**
 * Gamepad init;
 * Lifted from http://www.html5rocks.com/en/tutorials/doodles/gamepad/
 * @return {[type]} [description]
 */
Input.prototype.setGamepad = function() {
	// As of writing, it seems impossible to detect Gamepad API support
	// in Firefox, hence we need to hardcode it in the third clause. 
	// (The preceding two clauses are for Chrome.)
	var i = Input.TYPICAL_BUTTON_COUNT;

	this.gamepadSupportAvailable = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;

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
		this.startPolling();
	}
};

/**
 * [ description]
 * @return {[type]}         [description]
 */
Input.prototype.startPolling = function()
{
	// Don’t accidentally start a second loop, man.
    if (!this.isTicking) {
		this.isTicking = true;
		
		this.updateGamepads();
    }
};

/**
* Stops a polling loop by setting a flag which will prevent the next
* requestAnimationFrame() from being scheduled.
*/
Input.prototype.stopPolling = function() {
	this.isTicking = false;
};

  /**
   * A function called with each requestAnimationFrame(). Polls the gamepad
   * status and schedules another poll.
   */
// Input.prototype.tick = function() {
// 	this.pollStatus();
// 	this.scheduleNextTick();
// };

Input.prototype.updateGamepads = function(){
	if(this.isTicking) {
		this.pollStatus();
	}
};

// This function is called only on Chrome, which does not yet support connection/disconnection events,
// but requires you to monitor an array for changes.
Input.prototype.pollGamepads = function() {
	// Get the array of gamepads – the first method (function call) is the most modern one, the second is there for compatibility with
	// slightly older versions of Chrome, but it shouldn’t be necessary for long.
	var rawGamepads = (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) || navigator.webkitGamepads,
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

	return (this.gamepad) ? true : false;
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
* Checks for the gamepad status. Monitors the necessary data and notices
* the differences from previous state (buttons for Chrome/Firefox,
* new connects/disconnects for Chrome). If differences are noticed, asks
* to update the display accordingly. Should run as close to 60 frames per
* second as possible.
*/
Input.prototype.pollStatus = function() {
	// Poll to see if gamepads are connected or disconnected. Necessary
	// only on Chrome.
	this.pollGamepads();

	//for (var i in this.arrGamepads) {
		this.gamepad = this.arrGamepads[0];

		if(this.gamepad)
		{
			// Don’t do anything if the current timestamp is the same as previous
			// one, which means that the state of the gamepad hasn’t changed.
			// This is only supported by Chrome right now, so the first check
			// makes sure we’re not doing anything if the timestamps are empty
			// or undefined.
			if (this.gamepad.timestamp && (this.gamepad.timestamp == this.prevTimestamps[0])) {
				//continue;
				return;
			}

			this.prevTimestamps[0] = this.gamepad.timestamp;
		}
	//}
};

/**
*@public
*@param 	Number
*@returns 	Boolean
*/
Input.prototype.isButtonDown = function(gamepadCode) {
	return Boolean(this.gamepad.buttons[gamepadCode]);
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
	var i = arrGamepadCodes.length,
		gamepadCode;
	
	while(i--) {
		gamepadCode = arrGamepadCodes[i];
		this.arrPrevButtonDown[gamepadCode] = this.isButtonDown(gamepadCode);
	}
}

/**
 * @public
 * @param	Number
 * @returns Boolean
 */
Input.prototype.isButtonPressedOnce = function(gamepadCode) {
	return this.isButtonDown(gamepadCode) && !this.isPrevButtonDown(gamepadCode);
};

/**
*@public
*@param 	Number
*@returns 	Boolean
*/
Input.prototype.getAxis = function(gamepadCode) {
	return this.gamepad.axes[gamepadCode];
};

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

/**
*@private
*@param 	e
*@returns 	Boolean
*/
Input.prototype.isLeftVertUpOnce = function() {
	var vert = this.getAxis(GamepadCode.AXES.LEFT_STICK_VERT),
		prevVert = this.arrPrevAxesValues[GamepadCode.AXES.LEFT_STICK_VERT];

	return (vert < -Input.MOVE_THRESHOLD && prevVert != Math.round(vert));
};

/**
*@private
*@param 	e
*@returns 	Boolean
*/
Input.prototype.isLeftVertDownOnce = function() {
	var vert = this.getAxis(GamepadCode.AXES.LEFT_STICK_VERT),
		prevVert = this.arrPrevAxesValues[GamepadCode.AXES.LEFT_STICK_VERT];

	return (vert > Input.MOVE_THRESHOLD && prevVert != Math.round(vert));
};

/**
*@private
*@param 	e
*@returns 	Boolean
*/
Input.prototype.isLeftHoriLeftOnce = function() {
	var hori = this.getAxis(GamepadCode.AXES.LEFT_STICK_HOR),
		prevVert = this.arrPrevAxesValues[GamepadCode.AXES.LEFT_STICK_HOR];

	return (hori < -Input.MOVE_THRESHOLD && prevHori != Math.round(hori));
};

/**
*@private
*@param 	e
*@returns 	Boolean
*/
Input.prototype.isLeftHoriRightOnce = function() {
	var hori = this.getAxis(GamepadCode.AXES.LEFT_STICK_HOR),
		prevHori = this.arrPrevAxesValues[GamepadCode.AXES.LEFT_STICK_HOR];

	return (hori > Input.MOVE_THRESHOLD && prevHori != Math.round(hori));
};

/**
 * @public
 * @param	arrKeyCodes
 */
Input.prototype.checkPrevAxesValues = function() {
	var axisValue = null;

	for(var key in GamepadCode.AXES) {
		axisValue = GamepadCode.AXES[key];

		this.arrPrevAxesValues[axisValue] = Math.round(this.getAxis(axisValue));
	}
}

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
	return (
		this.isButtonDown(GamepadCode.BUTTONS.DPAD_UP) || 
		this.getAxis(GamepadCode.AXES.LEFT_STICK_VERT) < -Input.MOVE_THRESHOLD ||
		this.isKeyDown(KeyCode.W) || 
		this.isKeyDown(KeyCode.UP) 
	);
}

Input.prototype.isDown = function() {
	return (
		this.isButtonDown(GamepadCode.BUTTONS.DPAD_DOWN) || 
		this.getAxis(GamepadCode.AXES.LEFT_STICK_VERT) > Input.MOVE_THRESHOLD ||
		this.isKeyDown(KeyCode.S) ||
		this.isKeyDown(KeyCode.DOWN)
	);
}

Input.prototype.isLeft = function() {
	return (
		this.isButtonDown(GamepadCode.BUTTONS.DPAD_LEFT) || 
		this.getAxis(GamepadCode.AXES.LEFT_STICK_HOR) < -Input.MOVE_THRESHOLD ||
		this.isKeyDown(KeyCode.A) || 
		this.isKeyDown(KeyCode.LEFT)
	);
}

Input.prototype.isRight = function() {
	return (
		this.isButtonDown(GamepadCode.BUTTONS.DPAD_RIGHT) || 
		this.getAxis(GamepadCode.AXES.LEFT_STICK_HOR) > Input.MOVE_THRESHOLD ||
		this.isKeyDown(KeyCode.D) ||
		this.isKeyDown(KeyCode.RIGHT)
	);
}

Input.prototype.isUpOnce = function() {
	return (
		this.isButtonPressedOnce(GamepadCode.BUTTONS.DPAD_UP) ||
		this.isLeftVertUpOnce() ||
		this.isKeyPressedOnce(KeyCode.UP)
	);
}

Input.prototype.isDownOnce = function() {
	return (
		this.isButtonPressedOnce(GamepadCode.BUTTONS.DPAD_DOWN) ||
		this.isLeftVertDownOnce() ||
		this.isKeyPressedOnce(KeyCode.DOWN)
	);
}

Input.prototype.isLeftOnce = function() {
	return (
		this.isButtonPressedOnce(GamepadCode.BUTTONS.DPAD_LEFT) ||
		this.isLeftHoriLeftOnce() ||
		this.isKeyPressedOnce(KeyCode.LEFT)
	);
}

Input.prototype.isRightOnce = function() {
	return (
		this.isButtonPressedOnce(GamepadCode.BUTTONS.DPAD_RIGHT) ||
		this.isLeftHoriRightOnce() ||
		this.isKeyPressedOnce(KeyCode.RIGHT)
	);
}