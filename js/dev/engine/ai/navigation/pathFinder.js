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

	//create 1d array of sceneObjects for node invalidation comparison
	for(var key in this.sceneObjects) {
		sceneObjectType = this.sceneObjects[key];

		for(var i = 0; i < sceneObjectType.length; i++) {
			this.arrSceneObjects.push(sceneObjectType[i]);
		}
	}

	GraphHelper.createGrid(
		this.graph, 
		this.width, this.height, 
		this.numCells.x, this.numCells.y,
		this.arrSceneObjects
	);

	this.arrSceneObjects.length = 0;
	this.arrSceneObjects = null;

	//this.sourceIndex = this.pointToIndex(0, 0);
	//this.targetIndex = this.pointToIndex(Constants.WIDTH, Constants.HEIGHT);

	// this.graph.removeNode(223);
	// this.graph.removeNode(265);
	// this.graph.removeNode(267);
	// this.graph.removeNode(270);
	// this.graph.removeNode(289);

	this.searchAlgorithm = new AStarSearch(this.graph);

	// this.findPathByPosition(new app.b2Vec2(Constants.WIDTH - 1, Constants.HEIGHT * 0.5), new app.b2Vec2(Constants.WIDTH - 64, Constants.HEIGHT - 64));

	// GraphHelper.drawGrid(
	// 	LayerTypes.MAIN,
	// 	this.graph, 
	// 	this.searchAlgorithm.sourceIndex, 
	// 	this.searchAlgorithm.targetIndex, 
	// 	this.path, 
	// 	this.shortestPath
	// );

	// this.findPathByPosition(new app.b2Vec2(Constants.WIDTH - 1, Constants.HEIGHT - 256), new app.b2Vec2(Constants.WIDTH, Constants.HEIGHT));

	// GraphHelper.drawGrid(
	// 	LayerTypes.MAIN,
	// 	this.graph, 
	// 	this.searchAlgorithm.sourceIndex, 
	// 	this.searchAlgorithm.targetIndex, 
	// 	this.path, 
	// 	this.shortestPath
	// );

	//this.pathTable = GraphHelper.createPathTable(this.graph);

	// console.log("Path table");
	// console.log(this.pathTable);
};

PathFinder.prototype.clear = function() {
	this.graph.clear();	
	this.graph = null;

	this.searchAlgorithm.clear();
	this.searchAlgorithm = null;

	this.arrNodes.length = 0;
	this.arrNodes = null;

	this.sceneObjects = null;

	this.path = null;

	this.shortestPath = null;

	this.numCells = null;

	this.pathTable = null;

	this.arrSceneObjects = null;
};

PathFinder.prototype.findPath = function() {
	if(this.path !== null)
		this.path.length = 0;

	if(this.shortestPath !== null)
		this.shortestPath.length = 0;

	this.searchAlgorithm.search();

	this.path = this.searchAlgorithm.getPathToTarget();
	this.shortestPath = this.searchAlgorithm.getShortestPath();
	this.costToTarget = this.searchAlgorithm.getCostToTarget();

	// console.log("Path");
	// console.log(this.path);
	// console.log("ShortestPath");
	// console.log(this.shortestPath);
	// console.log("Cost");
	// console.log(this.costToTarget);

	return this.path;
};

PathFinder.prototype.findPathByPosition = function(sourcePos, targetPos) {
	this.searchAlgorithm.sourceIndex = this.pointToIndex(sourcePos.x, sourcePos.y);
	this.searchAlgorithm.targetIndex = this.pointToIndex(targetPos.x, targetPos.y);

	return this.findPath();
};

PathFinder.prototype.pointToIndex = function(x, y) {
	//convert coordinates to an index of a graph node
	var tempX = Math.floor(x / this.cellWidth),
		tempY = Math.floor(y / this.cellHeight),
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

PathFinder.prototype.getNodePosition = function(index) {
	return this.graph.getNode(index).position;
}

goog.exportSymbol('PathFinder', PathFinder);