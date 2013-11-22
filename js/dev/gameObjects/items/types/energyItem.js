goog.provide('EnergyItem');

goog.require('Item');

/**
*@constructor
*Ammo for Turret instances
*/
EnergyItem = function(colors, categoryBits, maskBits) {
	Item.call(this, categoryBits, maskBits);

	this.label = null;
	
	this.init();
};

goog.inherits(EnergyItem, Item)

/**
*@override
*@public
*/
EnergyItem.prototype.init = function() {
	this.container = new createjs.Container();

	this.shape = new createjs.Shape();
	this.shape.graphics
		.ss(2)
		.s(Constants.LIGHT_BLUE)
		.f(Constants.DARK_BLUE)
		.dc(0, 0, 12);
	this.shape.snapToPixel = true;
	//this.shape.cache(-7, -7, 14, 14);

	this.label = new createjs.Text("E", "16px AXI_Fixed_Caps_5x5", Constants.LIGHT_BLUE);
	this.label.x = -5;
	this.label.y = -7;
	
	this.setPhysics();

	this.container.addChild(this.shape);
	this.container.addChild(this.label);

	Item.prototype.init.call(this);
};

/**
*@override
*@public
*/
EnergyItem.prototype.update = function(options) {
	if(this.isAlive) {
		var scale = app.physicsScale;

		this.container.x = this.body.GetWorldCenter().x * scale;
		this.container.y = this.body.GetWorldCenter().y * scale;

		Item.prototype.update.call(this);
	}
};

EnergyItem.prototype.kill = function() {
	if(this.isAlive) {
		this.setIsAlive(false);
		this.container.getStage().removeChild(this.container);
	}
};

/**
*@private
*/
EnergyItem.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef();
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = this.categoryBits;
	fixDef.filter.maskBits = this.maskBits;
	fixDef.isSensor = true;
	fixDef.shape = new app.b2CircleShape(0.125);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetBullet(false);
	this.body.SetPosition(this.physicalPosition);
};


