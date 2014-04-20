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
	 * @type {[type]}
	 */
	this.arrPrevButtonDown = null;

	/**
	 * [gamepad description]
	 * @type {[type]}
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
		stageSelector = app.layers.getSelector(LayerTypes.MAIN),
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
	var i = Input.TYPICAL_BUTTON_COUNT,
		gamepadSupportAvailable = navigator.webkitGetGamepads || navigator.webkitGamepads;

	this.arrPrevButtonDown = new Array(length);

	while(i--) {
		this.arrPrevButtonDown[i] = false;
	}

	if (!gamepadSupportAvailable) {
		//Modal message / notification alerting non-Chrome user to use Chrome for gamepad / overall game support
		goog.events.dispatchEvent(this, this.gamePadSupportUnavailableEvent);
	} else {
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
 * @param	arrKeyCodes
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
 * @param	arrKeyCodes
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