goog.provide('DefaultFireState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
DefaultFireState = function(turret) {
	this.turret = turret;
};

goog.inherits(DefaultFireState, State);

DefaultFireState.KEY = "default";

/**
*@public
*/
DefaultFireState.prototype.enter = function(options) {
	this.turret.enterDefaultFire();
};

/**
*@public
*/
DefaultFireState.prototype.update = function(options) {
	this.turret.updateDefaultFire();
};

/**
*@public
*/
DefaultFireState.prototype.exit = function(options) {
	this.turret.exitDefaultFire();
};

goog.exportSymbol('DefaultFireState', DefaultFireState);