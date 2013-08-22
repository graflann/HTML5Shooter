goog.provide('TitlePanel');

goog.require('Panel');

/**
*@constructor
*Where the primary play activity takes place
*/
TitlePanel = function()
{
	Panel.call(this);
	
	/**
	*@type  {Shape}
	*/
	this.shape;


	this.init();
};

goog.inherits(TitlePanel, Panel);

/**
*@override
*@protected
*/
TitlePanel.prototype.init = function()
{	
    this.shape = new Shape();
	this.shape.graphics.setStrokeStyle(1);
	this.shape.graphics.beginStroke(Graphics.getRGB(0,0,0))
		.beginFill(Graphics.getRGB(255,0,0))
		.drawCircle(0,0,30);

    this.shape.x = 100;
    this.shape.y = 100;

    app.stage.addChild(this.shape);
};

/**
*@override
*@protected
*/
TitlePanel.prototype.update = function()
{
	
};

/**
*@override
*@protected
*/
TitlePanel.prototype.clear = function()
{
	app.stage.removeChild(this.shape);
	this.shape = null;
};