goog.require('Game');
goog.require('BrowserUtils');
goog.require('TrigonometricTable');
goog.require('Input');
goog.require('AssetsProxy');
goog.require('LayerSystem');
goog.require('ScoreManager');
goog.require('TimerManager');

/**
*@preserve
by Grant Flannery
Copyright (c) 2013
*/

//GLOBAL//////////////////////////////////////////////////////////
//Creation of application-level namespace to not pollute global window space
window.app = {};

//CLASS DECLARATIONS//////////////////////////////////////////////

//Truncates Box2D class declarations
app.b2Vec2 				= Box2D.Common.Math.b2Vec2;
app.b2AABB 				= Box2D.Collision.b2AABB;
app.b2BodyDef 			= Box2D.Dynamics.b2BodyDef;
app.b2Body 				= Box2D.Dynamics.b2Body;
app.b2FixtureDef 		= Box2D.Dynamics.b2FixtureDef;
app.b2Fixture 			= Box2D.Dynamics.b2Fixture;
app.b2World				= Box2D.Dynamics.b2World;
app.b2MassData 			= Box2D.Collision.Shapes.b2MassData;
app.b2PolygonShape 		= Box2D.Collision.Shapes.b2PolygonShape;
app.b2CircleShape 		= Box2D.Collision.Shapes.b2CircleShape;
app.b2DebugDraw			= Box2D.Dynamics.b2DebugDraw;
app.b2ContactListener 	= Box2D.Dynamics.b2ContactListener;	
//////////////////////////////////////////////////////////////////

//OBJECT DECLARATIONS & INSTANTIATIONS////////////////////////////
// app.stage 			= new createjs.Stage("stage");
// app.stageContext 	= document.getElementById("stage").getContext("2d");
app.layers          = null;
app.physicsWorld  	= null;
app.physicsScale 	= 20;
app.physicsDebug 	= false;
app.browserUtils 	= null;
app.input			= null;
app.pathFinder      = null;
app.assetsProxy     = null;
app.vecZero         = null;
app.scoreManager    = null;
app.timerManager    = null;
app.arenaWidth      = 0;
app.arenaHeight     = 0;
app.charWidth       = 6;

//////////////////////////////////////////////////////////////////

//POINT OF ENTRY//////////////////////////////////////////////////
$(function() {
    //disallow any GET file caching
    $.ajaxSetup ({ cache: false }); 

	app.browserUtils 	= BrowserUtils.getInstance();
	app.trigTable 		= TrigonometricTable.getInstance();
    app.layers          = LayerSystem.getInstance();
    app.input           = new Input();
    app.assetsProxy     = new AssetsProxy();
    app.vecZero         = new app.b2Vec2();
    app.physicsWorld    = new app.b2World(app.vecZero, false);
    app.scoreManager    = ScoreManager.getInstance();
    app.timerManager    = TimerManager.getInstance();

    app.game 			= new Game();
});
//////////////////////////////////////////////////////////////////

//EXTENSIONS//////////////////////////////////////////////////////
//These need to go into discrete file...

//Native Object extensions
Object.size = function(obj) {
    var size = 0, 
        key;

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            size++;
        }
    }
    
    return size;
};

//Native Array extensions
Array.last = function() {
    return this[this.length - 1];
};

//Native Math extensions
Math.randomInRange = function(min, max) {
    return min + (Math.random() * (max - min));
};

Math.randomInRangeWhole = function(min, max) {
    min = Math.round(min);
    max = Math.round(max);

    return min + Math.round(Math.random() * (max - min));
};

Math.degToRad = function(deg) {
	return deg * Math.PI / 180;
};

Math.radToDeg = function(rad) {
	return rad * 180 / Math.PI;
};

//CreateJS extensions
createjs.Rectangle.prototype.intersect = function(rect) {
    var isInRange = function(value, min, max) {
        return (value > min) && (value < max);
    };

    var xOverlap = isInRange(this.x, rect.x, rect.x + rect.width) ||
        isInRange(rect.x, this.x, this.x + this.width);

    var yOverlap = isInRange(this.y, rect.y, rect.y + rect.height) ||
        isInRange(rect.y, this.y, this.y + this.height);

    return (xOverlap && yOverlap);
};

createjs.Rectangle.prototype.intersectPoint = function(x, y) {
    return (
        (x > this.x && x < (this.x + this.width)) &&
        (y > this.y && y < (this.y + this.height))
    );
};

//Box2D extensions
Box2D.Common.Math.b2Vec2.prototype.DistanceSqrd = function(vec2D) {
    var xDist = Math.abs(this.x - vec2D.x),  
        yDist = Math.abs(this.y - vec2D.y);  

    return ((xDist * xDist) + (yDist * yDist)); 
};

Box2D.Common.Math.b2Vec2.prototype.Distance = function(vec2D) {
    return Math.sqrt(this.DistanceSqrd(vec2D)); 
};
//////////////////////////////////////////////////////////////////

////UTILITIES///////////////////////////////////////////////////////
function executeFunctionByName(functionName, context /*, args */) {
    var args = Array.prototype.slice.call(arguments, 2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for (var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
};
//////////////////////////////////////////////////////////////////
 








