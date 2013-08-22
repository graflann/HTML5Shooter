goog.provide('PanelFactory');

goog.require('PlayPanel');
goog.require('TitlePanel');

/**
*@constructor
*Where the primary play activity takes place
*/
PanelFactory = function()
{
	/**
	*A generic core that "attaches" to panel generation methods
    *@type {Object}
    */
	this.core = {};
	
	this.setCore();
};

/**
*@private
*Sets the initial core object
*/
PanelFactory.prototype.setCore = function()
{
	this.core.PlayPanel = function getPlayPanel()	{ return new PlayPanel(); };
	this.core.TitlePanel = function getTitlePanel()	{ return new TitlePanel(); };
};

/**
*@public
*Retrieves panel by string; use PanelTypes string constants as keys
*/
PanelFactory.prototype.getPanel = function(key)
{
	return new this.core[key];
};