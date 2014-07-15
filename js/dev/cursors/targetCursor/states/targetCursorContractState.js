goog.provide('TargetCursorContractState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
TargetCursorContractState = function(cursor) {
	this.cursor = cursor;
};

goog.inherits(TargetCursorContractState, State);

TargetCursorContractState.KEY = "contract";

/**
*@public
*/
TargetCursorContractState.prototype.enter = function(options) {
	this.cursor.enterContract(options);
};

/**
*@public
*/
TargetCursorContractState.prototype.update = function(options) {
	this.cursor.updateContract(options);
};

/**
*@public
*/
TargetCursorContractState.prototype.exit = function(options) {
	this.cursor.exitContract(options);
};

TargetCursorContractState.prototype.clear = function(options) {
	this.cursor = null;
};

goog.exportSymbol('TargetCursorContractState', TargetCursorContractState);