goog.provide('NavGraph');

goog.require('GraphNode');
goog.require('GraphEdge');

/**
*@constructor
*/
NavGraph = function(isDirectedGraph) {
	this.isDirectedGraph = isDirectedGraph || false;

	this.arrNodes = [];

	this.arrEdges = [];

	this.nextNodeIndex = 0;
};

NavGraph.prototype.setNodes = function(arrNodes) {
	var i = 0;

	this.clear();

	for(i; i < arrNodes.length; i++) {
		this.addNode(arrNodes[i]);
	}
};

NavGraph.prototype.getNode = function(index) {
	if(index >= this.arrNodes.length || index < 0) {
		throw new Error("index to get node invalid");
	}

	return this.arrNodes[index];
};

NavGraph.prototype.getEdge = function(nodeFrom, nodeTo) {
	if(nodeFrom < this.arrNodes.length && nodeFrom > 
		NavConstants.INVALID_NODE_INDEX &&
		this.arrNodes[nodeFrom] != NavConstants.INVALID_NODE_INDEX) {

		if(nodeTo < this.arrNodes.length && nodeTo > 
			NavConstants.INVALID_NODE_INDEX &&
			this.arrNodes[nodeTo] != NavConstants.INVALID_NODE_INDEX) {

			var i = 0,
				currentEdge = null;

			for(i; i < this.arrEdges[nodeFrom].length; i++) {
				currentEdge = this.arrEdges[nodeFrom][i];

				if(currentEdge.to == nodeTo) {
					return currentEdge;
				}
			}

		} else {
			throw new Error("nodeTo index invalid");
		}

	} else {
		throw new Error("nodeFrom index invalid");
	}

  	return null;
};

NavGraph.prototype.getNextFreeNodeIndex = function() {
	return this.nextNodeIndex;
};

NavGraph.prototype.addNode = function(node) {
	if(node.index < this.arrNodes.length) {

		if(this.arrNodes[node.index].index != NavConstants.INVALID_NODE_INDEX) {
			throw new Error("Attempting to add a node with duplicate ID.");
		}

		this.arrNodes[node.index] = node;

		return this.nextNodeIndex;
	} else {

		if(node.index != this.nextNodeIndex) {
			throw new Error("Invalid index");
		}

		this.arrNodes.push(node);

		return this.nextNodeIndex++;
	}
};

NavGraph.prototype.removeNode = function(nodeIndex) {
	this.arrNodes[nodeIndex].index = Constants.INVALID_NODE_INDEX;

	if(!this.isDirectedGraph) {	    
	    var i = 0,
	    	j = 0,
	    	currentEdge = null,
	    	currentEdgeTo = null;

	    for(i = 0; i < this.arrEdges[nodeIndex].length; i++) {
	    	currentEdge = this.arrEdges[nodeIndex][i];

	    	for(j = 0; j < this.arrEdges[currentEdge.nodeTo].length; i++) {
	    		currentEdgeTo = this.arrEdges[currentEdge.nodeTo][j];

	    		if(currentEdgeTo == node) {
	    			this.arrEdges[currentEdge.nodeTo].splice(j, 1);
	    			j--;

	    			break;
	    		}
	    	}
	    }

	    //finally, clear this node's edges
	    this.arrEdges[nodeIndex].length = 0;
	} else {
		//TODO: Figure out directed graph removal logic
	}
};

NavGraph.prototype.addEdge = function(edge) {
	if(edge.nodeFrom < this.nextNodeIndex && edge.nodeTo < this.nextNodeIndex) {

		if(this.arrNodes[edge.nodeTo].index != NavConstants.INVALID_NODE_INDEX && 
			this.arrNodes[edge.nodeFrom].index != NavConstants.INVALID_NODE_INDEX) {

			//determine existence of Array at index and create if null / undefined
			if(!this.arrEdges[edge.nodeFrom]) {
				this.arrEdges[edge.nodeFrom] = [];
			}

			if(this.isEdgeUnique(edge.nodeFrom, edge.nodeTo)) {
				this.arrEdges[edge.nodeFrom].push(edge);
			}
			
			//if the graph is undirected we must add another connection in the opposite direction
			if(!this.isDirectedGraph) {
				if(!this.arrEdges[edge.nodeTo]) {
					this.arrEdges[edge.nodeTo] = [];
				}

				//check to make sure the edge is unique before adding
				if (this.isEdgeUnique(edge.nodeTo, edge.nodeFrom))
				{
					var newEdge = new GraphEdge(edge.nodeFrom, edge.nodeTo);
					this.arrEdges[edge.nodeTo].push(newEdge);
				}
			}
		}
	} else {
		throw new Error("Insufficient node quantity (min 2) to allow edge creation.");
	}
};

NavGraph.prototype.removeEdge = function(nodeFrom, nodeTo) {
	if(nodeFrom < this.arrNodes.length && nodeTo < this.arrNodes.length) {
		var i = 0,
			currentEdge = null;

		if(!this.isDirectedGraph) {
			for(i = 0; i < this.arrEdges[nodeTo].length; i++) {
	    		currentEdge = this.arrEdges[nodeTo][i];

			    if(currentEdge.nodeTo == nodeFrom) {
	    			this.arrEdges[nodeTo].splice(i, 1);
	    			i--;

	    			break;
	    		}
		    }
		}

		for(i = 0; i < this.arrEdges[nodeFrom].length; i++) {
	    		currentEdge = this.arrEdges[nodeFrom][i];

			if(currentEdge.nodeTo == nodeTo) {
    			this.arrEdges[nodeFrom].splice(i, 1);
    			i--;

    			break;
    		}
		}

	} else {
		throw new Error("Edge removal arguments are not valid.");
	}
};

NavGraph.prototype.isEdgeUnique = function(nodeFrom, nodeTo) {
	var i = 0,
		currentEdge = null;

	for(i; i < this.arrEdges[nodeFrom].length; i++) {
		currentEdge = this.arrEdges[nodeFrom][i];

		if(currentEdge.nodeTo == nodeTo) {
			return false;
		}
	}

	return true;
};

NavGraph.prototype.cullInvalidEdges = function() {
	
};

NavGraph.prototype.nodeLength = function() {
	return this.arrNodes.length;
};

NavGraph.prototype.activeNodeLength = function() {
	var activeLength = 0,
		i = -1;

	while(++i < this.arrNodes.length) {
		if(this.arrNodes[i].index != NavGraph.INVALID_NODE_INDEX) {
			activeLength++;
		}
	}

	return activeLength;
};

NavGraph.prototype.edgeLength = function() {
	return this.arrEdges.length;
};

NavGraph.prototype.isEmpty = function() {
	return this.arrNodes.length > 0;
};

NavGraph.prototype.isNodePresent = function(index) {
	return this.getNode(index) != null;
};

NavGraph.prototype.isEdgePresent = function(nodeFrom, nodeTo) {
	if (this.isNodePresent(nodeFrom) && this.isNodePresent(nodeTo)){		 
		var currentEdge = null,
			i = 0;

		for(i; i < this.arrEdges[nodeFrom].length; i++) {
			currentEdge = this.arrEdges[nodeFrom][i];

			if(currentEdge.nodeTo == nodeTo) {
				return true;
			}
		}

        return false;
    } else {
    	return false;
    }
};

NavGraph.prototype.clear = function() {
	this.nextNodeIndex = 0;

	this.arrNodes.length = 0;
	this.arrEdges.length = 0;
};


goog.exportSymbol('NavGraph', NavGraph);