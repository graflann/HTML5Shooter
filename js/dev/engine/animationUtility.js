goog.provide('AnimationUtility');

/**
*Wraps createjs.BitmapAnimation to control framerate using createjs.Ticker
*@constructor
*/
AnimationUtility = function(name, bmpAnimation, frequency) {
	this.name = name;

	this.bmpAnimation = bmpAnimation;

	this.frequency = frequency || 1;

	this.spriteSheet = this.bmpAnimation.spriteSheet;

	this.animation = this.spriteSheet.getAnimation(this.name);

	this.minFrame = 0;

	this.maxFrame = this.animation.frames.length - 1;

	this.currentFrame = this.minFrame;

	this.isPlaying = false;

	this.isLooping = false;

	this.init();
};

/**
*@public
*/
AnimationUtility.prototype.init = function() {
	this.animation.frequency = this.frequency;

	this.stop();
};

AnimationUtility.prototype.update = function() {
	if(this.isPlaying && createjs.Ticker.getTicks() % this.frequency == 0) {
		this.currentFrame++;

		if(this.currentFrame > this.maxFrame) {
			this.currentFrame = this.minFrame;

			if(!this.isLooping) {
				this.stop();
			}
		}

		this.bmpAnimation.gotoAndStop(this.animation.frames[this.currentFrame]);
	}
};

/**
*@public
*/
AnimationUtility.prototype.play = function() {
	this.isPlaying = true;
};

/**
*@public
*/
AnimationUtility.prototype.stop = function(currentFrame) {
	this.currentFrame = currentFrame || this.minFrame;

	this.isPlaying = false;

	this.bmpAnimation.gotoAndStop(this.currentFrame);
};

/**
*@public
*/
AnimationUtility.prototype.loop = function(value) {
	this.isLooping = value;
};

AnimationUtility.prototype.clear = function() {
	this.animations = null;
	this.spriteSheet = null;
	this.bmpAnimation = null;
};

goog.exportSymbol('AnimationUtility', AnimationUtility);