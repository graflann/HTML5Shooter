goog.provide('SceneObject');

goog.require('GameObject');
goog.require('CollisionCategories');

/**
*@constructor
*Ammo for Turret instaces
*/
SceneObject = function() {
	GameObject.call(this);
	
	/**
	*@type {DisplayObject}
	*/
	this.shape;
	
	/**
	*physical body added to Box2D physicsWorld
	*@type {Box2D.Dynamics.b2Body}
	*/
	this.body;	
};

goog.inherits(SceneObject, GameObject)

/**
*@override
*@public
*/
SceneObject.prototype.init = function() {

};

/**
*@override
*@public
*/
SceneObject.prototype.update = function(options) {
	this.checkBounds();
};

/**
*@override
*@public
*/
SceneObject.prototype.clear = function() {
	this.shape.graphics.clear();
	this.shape = null;

	this.body.DestroyFixture(this.body.GetFixtureList());
	app.physicsWorld.DestroyBody(this.body);
	this.body = null;
};

SceneObject.prototype.kill = function() {
	this.body.SetAwake(false);
	this.shape.getStage().removeChild(this.shape);
	this.isAlive = false;
};

/**
*@override
*@public
*/
SceneObject.prototype.onCollide = function(options) {
	console.log("This is SceneObject: " + options);

	//this.kill();
};


