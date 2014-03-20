goog.provide('StateMachine');

/**
*@constructor
*State machine to handle GameObject AI states or component states
*/
StateMachine = function() {
	this.arrStates = [];

	this.currentKey = "";

	this.previousKey = "";

	this.currentState = null;
};

/**
*@public
*/
StateMachine.prototype.setState = function(key, options) {
	//init
	if (!this.currentKey) {
		this.currentKey = key;
		this.currentState = this.arrStates[this.currentKey].state;
		this.currentState.enter(options);
		return;
	}
	
	//redundancy
	if (this.currentKey === key) {
		//console.log("Attempting to go from " + this.currentKey + " to " + key + "  is redundant.");
		return;
	}
	
	//to allowed
	if (this.arrStates[this.currentKey].to.indexOf(key) != -1) {
		this.currentState.exit(options);
		
		this.previousKey = this.currentKey;
		this.currentKey = key;
		
		this.currentState = this.arrStates[this.currentKey].state;
	} else { //to disallowed
		console.log("Going from " + this.currentKey + " to " + key + " is an invalid state change.");
		return;
	}
	
	//if a state change is valid, transition into the new State...
	this.currentState.enter(options);
};

/**
*@public
*/
StateMachine.prototype.addState = function(key, state, arrToStates) {
	this.arrStates[key] = { state: state, to: arrToStates.toString() };
};

/**
*@public
*/
StateMachine.prototype.update = function(options) {
	this.currentState.update(options);
};

StateMachine.prototype.clear = function() {
	for(var key in this.arrStates) {
		this.arrStates[key].state.clear();
		this.arrStates[key] = null;
	}

	this.arrStates = null;
};

StateMachine.prototype.getCurrentState = function() {
	return this.currentKey;
};

StateMachine.prototype.reset = function() {
	this.currentKey = "";
	this.currentState = null;
};

goog.exportSymbol('StateMachine', StateMachine);