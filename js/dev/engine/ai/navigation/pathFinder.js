goog.provide('PathFinder');

goog.require('NavGraph');

/**
*@constructor
*/
PathFinder = function(arrNodes) {
	this.arrNodes = arrNodes;

	this.graph = null;

	this.init();
};

PathFinder.prototype.init = function() {
	this.graph = new NavGraph();
	//this.graph.setNodes(this.arrNodes);
};

PathFinder.prototype.clear = function() {
	this.graph.clear();

	this.arrNodes.length = 0;
	this.arrNodes = null;
};

goog.exportSymbol('PathFinder', PathFinder);