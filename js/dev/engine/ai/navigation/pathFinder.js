goog.provide('PathFinder');

goog.require('NavGraph');
goog.require('AStarSearch');

/**
*@constructor
*/
PathFinder = function() {
	this.path = null;

	this.graph = null;

	this.subTree = null;

	this.sourceIndex = 0;
	this.targetIndex = 0;

	this.costToTarget = 0;

	this.searchAlgorithm = null;

	this.cellWidth = Constants.WIDTH;
	this.cellHeight = Constants.HEIGHT;

	this.numCells = new app.b2Vec2(20, 20);

	this.width = this.cellWidth * this.numCells.x;
	this.height = this.cellHeight * this.numCells.y;

	this.start = false;
	this.finish = false;

	this.init();
};

PathFinder.prototype.init = function() {
	this.graph = new NavGraph();
	//this.graph.setNodes(this.arrNodes);
	
	this.searchAlgorithm = new AStarSearch(this.graph, 0, 0);
};

PathFinder.prototype.clear = function() {
	this.graph.clear();

	this.arrNodes.length = 0;
	this.arrNodes = null;
};

PathFinder.prototype.pointToIndex = function() {

};

PathFinder.prototype.setSource = function(value) {
	this.sourceIndex = value;
};

PathFinder.prototype.setTarget = function(value) {
	this.targetIndex = value;	
};

goog.exportSymbol('PathFinder', PathFinder);