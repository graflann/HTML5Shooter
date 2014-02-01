goog.provide('BoostParticle');

goog.require('Particle');

/**
*@constructor
*/
BoostParticle = function() {
	Particle.call(this);

	this.inc = 0;

	this.alphaCache = 0;
	this.scaleXCache = 0;
	this.scaleYCache = 0;
	
	this.init();
};

goog.inherits(BoostParticle, Particle)

/**
*@override
*@public
*/
BoostParticle.prototype.init = function() {
	var spriteSheet = app.assetsProxy.arrSpriteSheet["boost"];

	Particle.prototype.init.call(this);

	this.width = spriteSheet._frames[0].rect.width;
	this.height = spriteSheet._frames[0].rect.height;

	this.shape = new createjs.BitmapAnimation(spriteSheet);
	this.shape.regX = this.width * 0.5;
	this.shape.regY = this.height * 0.6;
	this.shape.gotoAndStop(0);
};

BoostParticle.MIN_ALPHA = 0.15;
BoostParticle.MAX_ALPHA = 0.65;
BoostParticle.ALPHA_DIFF = 0.25;

BoostParticle.MIN_SCALE_X = 0.25;
BoostParticle.SCALE_X_DIFF = 0.5;

BoostParticle.MIN_SCALE_Y = 0.75;
BoostParticle.SCALE_Y_DIFF = 0.25;

BoostParticle.INC = 0.02;

/**
*@override
*@public
*/
BoostParticle.prototype.update = function(options) {
	if (this.isAlive) {
		var target = options.target;

		this.shape.rotation = target.baseContainer.rotation;
		this.shape.x = target.position.x;
		this.shape.y = target.position.y;

		this.shape.alpha += this.inc;

		if(createjs.Ticker.getTicks() % 2 == 0) {
			this.scaleXCache = Math.randomInRange(0, BoostParticle.SCALE_X_DIFF);
			this.scaleYCache = Math.randomInRange(0, BoostParticle.SCALE_Y_DIFF);

			this.shape.scaleX += (this.inc + this.scaleXCache);
			this.shape.scaleY += (this.inc + this.scaleYCache);
		} else {
			this.shape.scaleX += (this.inc - this.scaleXCache);
			this.shape.scaleY += (this.inc - this.scaleYCache);
		}

		if(this.shape.alpha >= BoostParticle.MAX_ALPHA) {
			this.inc = -BoostParticle.INC;

			if(this.alphaCache > 0) this.alphaCache = -this.alphaCache;
			if(this.scaleXCache > 0) this.scaleXCache = -this.scaleXCache;
			if(this.scaleYCache > 0) this.scaleYCache = -this.scaleYCache;
		}
			
		if(this.shape.alpha < 0) {
			this.kill();
		}
	}
};

/**
*@override
*@public
*/
BoostParticle.prototype.create = function(options) {
	var target = options.target;

	this.shape.rotation = target.baseContainer.rotation;
	this.shape.x = target.position.x;
	this.shape.y = target.position.y;
	this.shape.alpha = BoostParticle.MIN_ALPHA;
	this.shape.scaleX = BoostParticle.MIN_SCALE_X;
	this.shape.scaleY = BoostParticle.MIN_SCALE_Y;

	this.inc = BoostParticle.INC;
	
	this.isAlive = true;
	
	app.layers.getStage(LayerTypes.MAIN).addChild(this.shape);

	this.shape.play();
};

/**
*@override
*@public
*/
BoostParticle.prototype.kill = function() {
	Particle.prototype.kill.call(this);

	this.shape.alpha = 1;
};
