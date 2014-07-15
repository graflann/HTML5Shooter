goog.provide('TargetCursorDefaultState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
TargetCursorDefaultState = function(cursor) {
	this.cursor = cursor;
};

goog.inherits(TargetCursorDefaultState, State);

TargetCursorDefaultState.KEY = "default";

/**
*@public
*/
TargetCursorDefaultState.prototype.enter = function(options) {
	this.cursor.enterDefault(options);
};

/**
*@public
*/
TargetCursorDefaultState.prototype.update = function(options) {
	this.cursor.updateDefault(options);
};

/**
*@public
*/
TargetCursorDefaultState.prototype.exit = function(options) {
	this.cursor.exitDefault(options);
};

TargetCursorDefaultState.prototype.clear = function(options) {
	this.cursor = null;
};

goog.exportSymbol('TargetCursorDefaultState', TargetCursorDefaultState);