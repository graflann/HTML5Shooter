goog.provide('TargetCursorFocusState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
TargetCursorFocusState = function(cursor) {
	this.cursor = cursor;
};

goog.inherits(TargetCursorFocusState, State);

TargetCursorFocusState.KEY = "focus";

/**
*@public
*/
TargetCursorFocusState.prototype.enter = function(options) {
	this.cursor.enterFocus(options);
};

/**
*@public
*/
TargetCursorFocusState.prototype.update = function(options) {
	this.cursor.updateFocus(options);
};

/**
*@public
*/
TargetCursorFocusState.prototype.exit = function(options) {
	this.cursor.exitFocus(options);
};

TargetCursorFocusState.prototype.clear = function(options) {
	this.cursor = null;
};

goog.exportSymbol('TargetCursorFocusState', TargetCursorFocusState);