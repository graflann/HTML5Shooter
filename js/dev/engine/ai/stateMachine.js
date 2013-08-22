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
StateMachine.prototype.setState = function(key) {
	//init
	if (!this.currentKey) {
		this.currentKey = key;
		this.currentState = this.arrStates[this.currentKey].state;
		this.currentState.enter();
		return;
	}
	
	//redundancy
	if (this.currentKey === key) {
		console.log("Attempting to go from " + this.currentKey + " to " + key + "  is redundant.");
		return;
	}
	
	//to allowed
	if (this.arrStates[this.currentKey].to.indexOf(key) != -1) {
		this.currentState.exit();
		
		this.previousKey = this.currentKey;
		this.currentKey = key;
		
		this.currentState = this.arrStates[this.currentKey].state;
	} else { //to disallowed
		console.log("Going from " + this.currentKey + " to " + key + " is an invalid state change.");
		return;
	}
	
	//if a state change is valid, transition into the new IState...
	this.currentState.enter();
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

};

goog.exportSymbol('StateMachine', StateMachine);