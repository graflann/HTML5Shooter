goog.provide('GraphNode');

goog.require('NavConstants');

/**
*@constructor
*/
GraphNode = function(index, position, options) {
	this.index = index || 0 ;

	this.position = position || new app.b2Vec2();

	this.options = options || null;
};

goog.exportSymbol('GraphNode', GraphNode);