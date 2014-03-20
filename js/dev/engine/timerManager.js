goog.provide('TimerManager');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');

/**
*Maintains a global Array of goog.Timer instances to turn on and turn off all Timers from a central location
*@constructor
*/
TimerManager = function() {
	this.arrTimers = [];
};

goog.inherits(TimerManager, goog.events.EventTarget);

/**
*@private
*/
TimerManager.instance = null;

/**
*@ return {TimerManager}
*/
TimerManager.getInstance = function() {
    if(TimerManager.instance === null) {
        TimerManager.instance = new TimerManager();
    }

    return TimerManager.instance;
};

TimerManager.prototype.add = function(interval, callback) {
    var timer = setTimeout(function() {
            
        }, 
        interval);

    this.arrTimers.push(timer);

    return timer;
};

TimerManager.prototype.startAll = function() {
    var i = -1;

    while(++i < this.arrTimers.length) {
        this.arrTimers[i].start();
    }
};

TimerManager.prototype.stopAll = function() {
    var i = -1;

    while(++i < this.arrTimers.length) {
        clearTimeout(this.arrTimers[i]);
    }
};

TimerManager.prototype.reset = function() {
    var i = -1;

    while(++i < this.arrTimers.length) {
        this.arrTimers[i].dispose();
        this.arrTimers[i] = null;
    }

    this.arrTimers.length = 0;
};