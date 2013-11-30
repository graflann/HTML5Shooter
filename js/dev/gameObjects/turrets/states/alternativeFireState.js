goog.provide('AlternativeFireState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
AlternativeFireState = function(turret) {
	this.turret = turret;
};

goog.inherits(AlternativeFireState, State);

AlternativeFireState.KEY = "alternative";

/**
*@public
*/
AlternativeFireState.prototype.enter = function(options) {
	this.turret.enterAltFire();
};

/**
*@public
*/
AlternativeFireState.prototype.update = function(options) {
	
};

/**
*@public
*/
AlternativeFireState.prototype.exit = function(options) {

};

goog.exportSymbol('AlternativeFireState', AlternativeFireState);