goog.provide('Application');

goog.require('Game');
goog.require('BrowserUtils');
goog.require('TrigonometricTable');
goog.require('Input');
goog.require('AssetsProxy');
goog.require('LayerSystem');
goog.require('ScoreManager');

Application = function() {
	//disallow any GET file caching
    //$.ajaxSetup ({ cache: false, dataType: 'json' });
    $.ajaxSetup ({ cache: true, dataType: 'json' });

	app.browserUtils 	= BrowserUtils.getInstance();
	app.trigTable 		= TrigonometricTable.getInstance();
    app.layers          = LayerSystem.getInstance();
    app.input           = new Input();
    app.assetsProxy     = new AssetsProxy();
    app.vecZero         = new app.b2Vec2();
    app.physicsWorld    = new app.b2World(app.vecZero, false);
    app.scoreManager    = ScoreManager.getInstance();

    app.game 			= new Game();
	//////////////////////////////////////////////////////////////////
};

goog.exportSymbol("Application", Application);