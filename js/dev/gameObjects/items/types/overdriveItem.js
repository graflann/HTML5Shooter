goog.provide('OverdriveItem');

goog.require('Item');

/**
*@constructor
*Ammo for Turret instances
*/
OverdriveItem = function(categoryBits) {
	Item.call(this, categoryBits);

	this.label = null;

	this.value = 100;
	
	this.init();
};

goog.inherits(OverdriveItem, Item)

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

	this.container.addChild(this.shape);
	this.container.addChild(this.label);
	this.container.cache(-14, -14, 28, 28);

	Item.prototype.init.call(this);
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


