goog.provide('Application');

goog.require('Game');
goog.require('BrowserUtils');
goog.require('TrigonometricTable');
goog.require('Input');
goog.require('AssetsProxy');
goog.require('LevelProxy');
goog.require('LayerSystem');
goog.require('ScoreManager');

Application = function() {
	//disallow any GET file caching
    $.ajaxSetup ({ cache: false, dataType: 'json' });
    //$.ajaxSetup ({ cache: true, dataType: 'json' });

    //true uses updated requestAnimationFrame instead of less optimized setTimeout
    //updates @ 60fps (this may change pending performance)
    createjs.Ticker.useRAF = true; 
    createjs.Ticker.setFPS(60);

	app.browserUtils 	= BrowserUtils.getInstance();
	app.trigTable 		= TrigonometricTable.getInstance();
    app.input           = new Input();
    app.layers          = LayerSystem.getInstance();
    app.assetsProxy     = new AssetsProxy();
    app.levelProxy      = new LevelProxy();
    app.vecZero         = new app.b2Vec2();
    app.physicsWorld    = new app.b2World(app.vecZero, false);
    app.scoreManager    = ScoreManager.getInstance();

    app.game 			= new Game();
	//////////////////////////////////////////////////////////////////
};

goog.exportSymbol("Application", Application);