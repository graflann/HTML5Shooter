goog.provide('ScoreManager');

goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.events');
goog.require('PayloadEvent');

/**
*@constructor
*/
ScoreManager = function() {
	this.score = 0;

    this.bonusValue = 0;

    this.bonusMultiplier = 1;

    this.updateScoreEvent = new PayloadEvent(EventNames.UPDATE_SCORE, this, this.score);
    this.updateBonusEvent = new PayloadEvent(EventNames.UPDATE_BONUS, this, this.bonusMultiplier);
};

goog.inherits(ScoreManager, goog.events.EventTarget);

/**
*@private
*/
ScoreManager.instance = null;

ScoreManager.MIN_BONUS_MULTIPLIER = 1;
ScoreManager.MAX_BONUS_MULTIPLIER = 10;

/**
*@ return {ScoreManager}
*/
ScoreManager.getInstance = function() {
    if(ScoreManager.instance === null) {
        ScoreManager.instance = new ScoreManager();
    }

    return ScoreManager.instance;
};

ScoreManager.prototype.updateScore = function(value) {
    this.bonusValue = value * this.bonusMultiplier;

    this.score += this.bonusValue;

    this.updateScoreEvent.payload = this.score;

    goog.events.dispatchEvent(this, this.updateScoreEvent);
};

ScoreManager.prototype.updateBonusMultiplier = function(value) {
    this.bonusMultiplier += value;

    //cap the min / max values of the bonus multiplier
    if(this.bonusMultiplier > ScoreManager.MAX_BONUS_MULTIPLIER) {
        this.bonusMultiplier = ScoreManager.MAX_BONUS_MULTIPLIER;
    }
    else if(this.bonusMultiplier < ScoreManager.MIN_BONUS_MULTIPLIER) {
        this.bonusMultiplier = ScoreManager.MIN_BONUS_MULTIPLIER;
    }

    //updates payload with rounded value to tenths
    this.updateBonusEvent.payload = this.bonusMultiplier = Math.round(this.bonusMultiplier * 10)/10;

    goog.events.dispatchEvent(this, this.updateBonusEvent);
};

ScoreManager.prototype.reset = function() {
    this.score = 0;

    this.bonusValue = 0;

    this.bonusMultiplier = 1;
};