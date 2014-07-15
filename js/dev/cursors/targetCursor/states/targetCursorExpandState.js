goog.provide('TargetCursorExpandState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
TargetCursorExpandState = function(cursor) {
	this.cursor = cursor;
};

goog.inherits(TargetCursorExpandState, State);

TargetCursorExpandState.KEY = "expand";

/**
*@public
*/
TargetCursorExpandState.prototype.enter = function(options) {
	this.cursor.enterExpand(options);
};

/**
*@public
*/
TargetCursorExpandState.prototype.update = function(options) {
	this.cursor.updateExpand(options);
};

/**
*@public
*/
TargetCursorExpandState.prototype.exit = function(options) {
	this.cursor.exitExpand(options);
};

TargetCursorExpandState.prototype.clear = function(options) {
	this.cursor = null;
};

goog.exportSymbol('TargetCursorExpandState', TargetCursorExpandState);