goog.provide('PanelFactory');

goog.require('PlayPanel');
goog.require('TitlePanel');
goog.require('OptionsPanel');
goog.require('PathFindingPanel');
goog.require('LoadingPanel');

/**
*@constructor
*Factory pattern constructs a new Panel instance via key
*/
PanelFactory = function() {
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
PanelFactory.prototype.setCore = function() {
	this.core.PlayPanel 		= function getPlayPanel()		{ return new PlayPanel(); };
	this.core.TitlePanel 		= function getTitlePanel()		{ return new TitlePanel(); };
	this.core.OptionsPanel 		= function getOptionsPanel()	{ return new OptionsPanel(); };
	this.core.PathFindingPanel 	= function getPathFindingPanel(){ return new PathFindingPanel(); };
	this.core.LoadingPanel 		= function getLoadingPanel()	{ return new LoadingPanel(); };
};

/**
*@public
*Retrieves panel by string; use PanelTypes string constants as keys
*/
PanelFactory.prototype.getPanel = function(key) {
	return new this.core[key];
};