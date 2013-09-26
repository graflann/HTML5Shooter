goog.provide('AStarSearch');

goog.require('NavGraph');
goog.require('GraphNode');
goog.require('GraphEdge');
goog.require('SearchContants');

/**
*@constructor
*/
AStarSearch = function(graph, sourceIndex, targetIndex) {
	this.graph = graph;

	this.sourceIndex = sourceIndex;

	this.targetIndex = targetIndex;

	this.arrGCosts = new Array(this.graph.nodeLength());

	this.arrFCosts = new Array(this.graph.nodeLength());

	this.arrShortestPath = [];

	this.arrSearchFrontier = [];
};

AStarSearch.prototype.search = function() {
	//create an indexed priority queue of nodes. The nodes with the
	//lowest overall F cost (G+H) are positioned at the front.

	//clone the estimated costs Array
	var arrCosts = this.arrFCosts.slice(0),
		nextClosestIndex = 0,
		GCost = 0,
		HCost = 0,
		targetNode = this.graph.getNode(this.targetIndex);
		arrEdges = null,
		edge = null;

	arrCosts.sort(this.sortCostsDescending);

	//put the source node on the front of the Array
	arrCosts.unshift(this.sourceIndex);

	//while the queue is not empty
	while(arrCosts.length > 0) {
		//get lowest cost node from the queue
		nextClosestIndex = arrCosts.pop();

		//move this node from the frontier to the spanning tree
		this.arrShortestPath[nextClosestIndex] = this.arrSearchFrontier[nextClosestIndex];

		//if the target has been found exit
		if (nextClosestIndex === this.targetIndex) {
			return;
		}
		
		arrEdges = this.graph.arrEdges[nextClosestIndex];

		for(var key in arrEdges) {
			edge = arrEdges[key];

			//squared distance used as heuristic to cut down overhead
			//TODO: optimize to not derive linear heuristic distance with sqrt
			HCost = targetNode.Distance(edge.nodeTo);
			GCost = this.arrGCosts[nextClosestIndex] + edge.cost;

			if(!this.arrSearchFrontier[edge.nodeTo]) {
				this.arrFCosts[edge.nodeTo] = GCost + HCost;
				this.arrGCosts[edge.nodeTo] = GCost;

				arrCosts.unshift(edge.nodeTo);

				this.arrSearchFrontier[edge.nodeTo] = edge;
			} else if((GCost < this.arrGCosts[edge.nodeTo]) && (!this.arrShortestPath[edge.nodeTo])) {

				//pq.ChangePriority(pE->To());

				this.arrSearchFrontier[edge.nodeTo] = edge;
			}
		}
	}
};

AStarSearch.prototype.getShortestPath = function() {
	return this.arrShortestPath;
};

AStarSearch.prototype.getPathToTarget = function() {
	var path = [],
		nodeIndex = 0;

	//just return an empty path if no target or no path found
	if (this.targetIndex < 0)  {
		return path;
	}    

	nodeIndex = this.targetIndex;

	path.unshift(nodeIndex);

	while (nodeIndex != this.sourceIndex && this.arrShortestPath[nodeIndex] != 0) {
		nodeIndex = this.arrShortestPath[nodeIndex].nodeFrom;

		path.unshift(nodeIndex);
	}

	return path;
};

AStarSearch.prototype.getCostToTarget = function() {
	return this.arrRealCosts[this.target]
};

AStarSearch.prototype.sortCostsDescending = function(a, b) {
	return b - a;
};

goog.exportSymbol('AStarSearch', AStarSearch);