goog.provide('State');

/**
*@constructor
*A component of a StateMachine;
*There are methods to provide logic during an entry point, an update loop, and an exit point
*This is not abstract; it can be instanced as a standalone State, intentionally void of function
*Derive other classes with functional implementations in action methods
*/
State = function() {};

State.KEY = "void";

/**
*@public
*/
State.prototype.enter = function(options) {};

/**
*@public
*/
State.prototype.update = function(options) {};

/**
*@public
*/
State.prototype.exit = function(options) {};

goog.exportSymbol('State', State);