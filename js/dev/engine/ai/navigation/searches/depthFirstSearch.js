goog.provide('DepthFirstSearch');

goog.require('NavGraph');
goog.require('GraphNode');
goog.require('GraphEdge');
goog.require('SearchConstants');

/**
*@constructor
*/
DepthFirstSearch = function(graph, source, target) {
	this.graph = graph;

	this.source = source;

	this.target = target;

	//has target been found?
	this.isFound = false;

	//this records the indexes of all the nodes that are visited as the
    //search progresses
	this.arrHasVisited = new Array(this.graph.nodeLength());

	//this holds the route taken to the target. Given a node index, the value
  	//at that index is the node's parent. ie if the path to the target is
  	//3-8-27, then m_Route[8] will hold 3 and m_Route[27] will hold 8.
	this.route = new Array(this.graph.nodeLength());

	this.spanningTree = [];

	this.init();
};

DepthFirstSearch.prototype.init = function() {
	var i;

	for(i = 0; i < this.arrHasVisited.length; i++) {
		this.arrHasVisited[i] = SearchContants.UNVISITED;
	}

	for(i = 0; i < this.route.length; i++) {
		this.route[i] = SearchContants.NO_PARENT_ASSIGNED;
	}
};

DepthFirstSearch.prototype.search = function() {
	var arrEdges = [],
		tempEdge = new GraphEdge(this.source, this.source),
		nextEdge = null,
		currentEdge = null,
		i = 0;

	arrEdges.push(tempEdge);

	while(arrEdges.length > 0) {
		nextEdge = arrEdges.last();

		arrEdges.pop();

		this.route[nextEdge.nodeTo] = nextEdge.nodeFrom;

		if(nextEdge != tempEdge) {
			this.spanningTree.push(nextEdge);
		}

		this.arrHasVisited[nextEdge.nodeTo] = SearchContants.VISITED;

		if(nextEdge.nodeTo == this.target) {
			return true;
		}

		//push the edges leading from the node this edge points to onto
   		//the stack (provided the edge does not point to a previously 
    	//visited node)
		for(i = 0; i < this.graph.arrEdges[nextEdge.nodeTo].length; i++) {
			currentEdge = this.graph.arrEdges[nextEdge.nodeTo][i];

			if(this.arrHasVisited[currentEdge.nodeTo] == SearchContants.UNVISITED) {
				arrEdges.push(currentEdge);
			}
		}
	}

	return false;
};

DepthFirstSearch.prototype.getPathToTarget = function() {
	var path = [],
		node;

	if(!this.isFound || this.target < 0) {
		return path;
	}

	node = this.target;
	path.push(node);

	while (node != this.source) {
		node = this.route[node];
		path.unshift(node);
	}

	return path;
};

DepthFirstSearch.prototype.getSearchTree = function() {
	return this.spanningTree;
};

DepthFirstSearch.prototype.found = function() {
	return this.isFound;
};

goog.exportSymbol('DepthFirstSearch', DepthFirstSearch);