goog.provide('PayloadEvent');

goog.require('goog.events');
goog.require('goog.events.Event');

/**
*@constructor
*Custom Event extending goog.events.Event with custom payload object
*/
PayloadEvent = function(type, opt_target, payload) {
	goog.events.Event.call(this, type, opt_target);

	this.payload = payload || null;
};

goog.inherits(PayloadEvent, goog.events.Event);