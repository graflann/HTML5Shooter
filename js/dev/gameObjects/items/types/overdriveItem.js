goog.provide('OverdriveItem');

goog.require('Item');
goog.require('BoundsUtils');

/**
*@constructor
*"Overdrive" mmo for Turret instances
*/
OverdriveItem = function(categoryBits) {
	Item.call(this, categoryBits);

	this.label = null;

	this.value = 10;

	this.secondsAlive = 16;

	this.timerThreshold = createjs.Ticker.getFPS() * this.secondsAlive;

	this.alphaTimer = 0;

	this.alphaTimerThreshold =  this.timerThreshold * 0.75;

	this.alphaDecrement = (this.timerThreshold - this.alphaTimerThreshold) / 
		(createjs.Ticker.getFPS() * (8 *(this.timerThreshold - this.alphaTimerThreshold)));
	
	this.init();
};

goog.inherits(OverdriveItem, Item);

OverdriveItem.BONUS_PENALTY = -1;

/**
*@override
*@public
*/
OverdriveItem.prototype.init = function() {
	this.container = new createjs.Container();

	this.shape = new createjs.Shape();
	this.shape.graphics
		.ss(2)
		.s(Constants.YELLOW)
		.f(Constants.DARK_RED)
		.dc(0, 0, 12);
	this.shape.snapToPixel = true;

	this.label = new createjs.Text("O", "16px AXI_Fixed_Caps_5x5", Constants.YELLOW);
	this.label.x = -5;
	this.label.y = -7;
	
	this.setPhysics();

	this.alphaTimer = 0;

	this.container.addChild(this.shape);
	this.container.addChild(this.label);
	this.container.cache(-14, -14, 28, 28);

	this.collisionRoutingObject = new CollisionRoutingObject();
	this.collisionRoutingObject.type = ItemTypes.OVERDRIVE;

	Item.prototype.init.call(this);
};

/**
*@override
*@public
*/
OverdriveItem.prototype.update = function(options) {
	if(this.isAlive) {
		this.physicalPosition = this.body.GetPosition();

		this.container.x = this.physicalPosition.x * app.physicsScale;
		this.container.y = this.physicalPosition.y * app.physicsScale;

		this.container.rotation = Math.radToDeg(this.body.GetAngle());

		if(++this.alphaTimer > this.alphaTimerThreshold) {
			this.container.alpha -= this.alphaDecrement;

			if(this.container.alpha <= 0) {
				this.alphaTimer = 0;
				this.kill();

				//penalize the bonus multiplier for the item's expiration
				app.scoreManager.updateBonusMultiplier(OverdriveItem.BONUS_PENALTY);
			}
		}

		this.checkBounds();

		BoundsUtils.checkBounds(this.position, this.container, options.camera);
	}
};

/**
*@override
*@public
*/
OverdriveItem.prototype.clear = function() {
	this.container.uncache();

	Item.prototype.clear.call(this);

	this.label = null;
};

OverdriveItem.prototype.setIsAlive = function(value) {
	Item.prototype.setIsAlive.call(this, value);

	this.container.alpha = 1;
	this.alphaTimer = 0;
};

/**
*@private
*/
OverdriveItem.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef();
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = this.categoryBits;
	fixDef.filter.maskBits = CollisionCategories.SCENE_OBJECT | CollisionCategories.PLAYER_BASE;
	fixDef.shape = new app.b2CircleShape(0.5);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetPosition(this.physicalPosition);
};


