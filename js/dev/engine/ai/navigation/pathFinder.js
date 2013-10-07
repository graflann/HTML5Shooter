goog.provide('PathFinder');

goog.require('NavGraph');
goog.require('GraphHelper');
goog.require('AStarSearch');
goog.require('NavConstants');
goog.require('LayerTypes');

/**
*@constructor
*/
PathFinder = function(width, height, sceneObjects) {
	this.width = width;
	this.height = height;

	this.sceneObjects = sceneObjects;

	this.path = null;

	this.graph = null;

	this.shortestPath = null;

	this.sourceIndex = 0;
	this.targetIndex = 0;

	this.costToTarget = 0;

	this.searchAlgorithm = null;

	this.cellWidth = Constants.UNIT;
	this.cellHeight = Constants.UNIT;

	this.numCells = new app.b2Vec2(
		this.width / this.cellWidth, 
		this.height /  this.cellHeight
	);

	this.pathTable = null;

	this.arrSceneObjects = [];

	this.init();
};

PathFinder.prototype.init = function() {
	var sceneObjectType = null;

	this.graph = new NavGraph();

	//create 1d array of sceneObjects for node invalidationn comparison
	// for(var key in this.sceneObjects) {
	// 	sceneObjectType = this.sceneObjects[key];

	// 	for(var i = 0; i < sceneObjectType.length; i++) {
	// 		this.arrSceneObjects.push(sceneObjectType[i]);
	// 	}
	// }

	GraphHelper.createGrid(
		this.graph, 
		this.width, this.height, 
		this.numCells.x, this.numCells.y,
		null
	);

	this.arrSceneObjects.length = 0;
	this.arrSceneObjects = null;

	this.sourceIndex = this.pointToIndex(64, 320);
	this.targetIndex = this.pointToIndex(340, 420);

	this.graph.removeNode(223);
	this.graph.removeNode(265);
	this.graph.removeNode(267);
	this.graph.removeNode(270);
	this.graph.removeNode(289);

	this.searchAlgorithm = new AStarSearch(this.graph, this.sourceIndex, this.targetIndex);

	this.findPath();

	GraphHelper.drawGrid(
		LayerTypes.MAIN,
		this.graph, 
		this.sourceIndex, 
		this.targetIndex, 
		this.path, 
		this.shortestPath
	);

	//this.pathTable = GraphHelper.createPathTable(this.graph);

	console.log("Path table");
	console.log(this.pathTable);
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
		tempY = Math.round(y / this.cellHeight),
		index = 0,
		min = 0,
		max = (this.numCells.x * this.numCells.y) - 1; 

	//calculate the index
	index = (tempY * this.numCells.x) + tempX;

	//ensure the index remains within node bounds
	if(index < min) {
		index = min;
	} else if(index > max) {
		index = max;
	}

	return index;
};

PathFinder.prototype.setSource = function(value) {
	this.sourceIndex = value;
};

PathFinder.prototype.setTarget = function(value) {
	this.targetIndex = value;	
};

goog.exportSymbol('PathFinder', PathFinder);