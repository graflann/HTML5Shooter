goog.provide('CollisionEvent');

goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('EventNames');

/**
*@constructor
*Custom CollisionEvent extending goog.events.Event
*/
CollisionEvent = function(opt_target) {
	goog.events.Event.call(this, EventNames.COLLISION, opt_target);

	this.collisionObject = null;
};

goog.inherits(CollisionEvent, goog.events.Event);