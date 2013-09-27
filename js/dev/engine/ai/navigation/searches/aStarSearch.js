goog.provide('AStarSearch');

goog.require('NavGraph');
goog.require('GraphNode');
goog.require('GraphEdge');
goog.require('NavConstants');
goog.require('SearchConstants');

/**
*@constructor
*/
AStarSearch = function(graph, sourceIndex, targetIndex) {
	this.graph = graph;

	this.sourceIndex = sourceIndex || 0;

	this.targetIndex = targetIndex || 0;

	/**
	 * 'Reals' costs 
	 * @type {Array}
	 */
	this.arrGCosts = new Array(this.graph.nodeLength());

	/**
	 * Heuristic costs
	 * @type {Array}
	 */
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
		toNode = null,
		arrEdges = null,
		edge = null;

	arrCosts.sort(this.sortCostsAscending);

	//put the source node on the front of the Array
	arrCosts.push(this.sourceIndex);

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
			
			nodeTo = this.graph.getNode(edge.nodeTo);
			HCost = targetNode.position.Distance(nodeTo.position);
			GCost = this.arrGCosts[nextClosestIndex] + edge.cost;

			if(!this.arrSearchFrontier[edge.nodeTo]) {
				this.arrFCosts[edge.nodeTo] = GCost + HCost;
				this.arrGCosts[edge.nodeTo] = GCost;

				arrCosts.push(edge.nodeTo);
				arrCosts.sort(this.sortCostsAscending);

				this.arrSearchFrontier[edge.nodeTo] = edge;

			} else if((GCost < this.arrGCosts[edge.nodeTo]) && 
				(!this.arrShortestPath[edge.nodeTo])) {
				this.arrFCosts[edge.nodeTo] = GCost + HCost;
				this.arrGCosts[edge.nodeTo] = GCost;
				
				arrCosts.sort(this.sortCostsAscending);

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
	return this.arrGCosts[this.targetIndex]
};

AStarSearch.prototype.sortCostsAscending = function(a, b) {
	return a - b;
};

goog.exportSymbol('AStarSearch', AStarSearch);