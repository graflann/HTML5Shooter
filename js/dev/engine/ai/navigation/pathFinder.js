goog.provide('PathFinder');

goog.require('NavGraph');
goog.require('GraphHelper');
goog.require('AStarSearch');
goog.require('NavConstants');

/**
*@constructor
*/
PathFinder = function() {
	this.path = null;

	this.graph = null;

	this.shortestPath = null;

	this.sourceIndex = 0;
	this.targetIndex = 0;

	this.costToTarget = 0;

	this.searchAlgorithm = null;

	this.cellWidth = Constants.UNIT;
	this.cellHeight = Constants.UNIT;

	this.numCells = new app.b2Vec2(20, 20);

	this.width = this.cellWidth * this.numCells.x;
	this.height = this.cellHeight * this.numCells.y;

	this.start = false;
	this.finish = false;

	this.arrNodeShapes = [];
	this.arrEdgeShapes = [];
	this.arrPathShapes = [];

	this.init();
};

PathFinder.prototype.init = function() {
	this.graph = new NavGraph();

	GraphHelper.createGrid(
		this.graph, 
		this.width, this.height, 
		this.numCells.x, this.numCells.y
	);

	this.sourceIndex = this.pointToIndex(this.width * 0.5, this.cellHeight * 2);
	this.targetIndex = this.pointToIndex(this.width * 0.5, this.height - (this.cellHeight * 2));

	this.searchAlgorithm = new AStarSearch(this.graph, this.sourceIndex, this.targetIndex);

	this.findPath();

	GraphHelper.drawGrid(this.graph, this.sourceIndex, this.targetIndex, this.path);
};

PathFinder.prototype.clear = function() {
	this.graph.clear();

	this.arrNodes.length = 0;
	this.arrNodes = null;
};

PathFinder.prototype.findPath = function() {
	this.searchAlgorithm.search();

	this.path = this.searchAlgorithm.getPathToTarget();
	this.shortestPath = this.searchAlgorithm.getShortestPath();
	this.costToTarget = this.searchAlgorithm.getCostToTarget();

	console.log("Path");
	console.log(this.path);
	console.log("ShortestPath");
	console.log(this.shortestPath);
	console.log("Cost");
	console.log(this.costToTarget);
};

PathFinder.prototype.pointToIndex = function(x, y) {
	//convert coordinates to an index of a graph node
	var tempX = Math.round(x / this.cellWidth),
		tempY = Math.round(y / this.cellHeight); 

	//make sure the values are legal
	if (tempX > this.numCells.x || tempY > this.numCells.y) {
		return NavConstants.INVALID_NODE_INDEX;
	}

	return (tempY * this.numCells.x) + tempX;
};

PathFinder.prototype.setSource = function(value) {
	this.sourceIndex = value;
};

PathFinder.prototype.setTarget = function(value) {
	this.targetIndex = value;	
};

goog.exportSymbol('PathFinder', PathFinder);