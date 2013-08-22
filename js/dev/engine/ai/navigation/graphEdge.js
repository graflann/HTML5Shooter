goog.provide('GraphEdge');

/**
*@constructor
*/
GraphEdge = function(nodeFrom, nodeTo, cost) {
	this.nodeFrom = nodeFrom || 0;

	this.nodeTo = nodeTo || 0;

	this.cost = cost || 0;
};

goog.exportSymbol('GraphEdge', GraphEdge);