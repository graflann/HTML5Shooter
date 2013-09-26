goog.provide('GraphHelper');

GraphHelper = {};

GraphHelper.isValidNeighbor = function(x, y, numCellsX, numCellsY) {
    return !(x < 0 || x >= numCellsX || y < 0 || y >= numCellsY);
};

GraphHelper.addAllNeighborsToGridNode = function(graph, row, col, numCellsX, numCellsY) {
    for (var i = 1; i < 2; ++i) {
        for (var j = 1; j < 2; ++j) {
            var nodeX = col + j;
            var nodeY = row + i;

            //skip if equal to this node
            if (i === 0 && j === 0) {
                continue;
            }

            //check to see if this is a valid neighbour
            if (GraphHelper.isValidNeighbor(nodeX, nodeY, numCellsX, numCellsY)) {

                //calculate the distance to this node
                var value               = (row * numCellsX) + col,
                    neighborValue       = (nodeY * numCellsX) + nodeX,
                    tempNode            = graph.getNode(value).position,
                    tempNodeNeighbor    = graph.getNode(neighborValue).position,
                    distance            = tempNode.Distance(tempNodeNeighbor);

                graph.addEdge(new GraphEdge(value, neighbourValue, distance));
            }
        }
    }
};

GraphHelper.createGrid = function(graph, levelW, levelH, numCellsX, numCellsY) {
    var cellWidth   = levelW / numCellsX,
        cellHeight  = levelH / numCellsY,
        midX        = cellWidth * 0.5,
        midY        = cellHeight * 0.5;

    //first create all the nodes
    for (var row = 0; row < numCellsY; row++) {
        for (int col = 0; col < numCellsX; col++) {
            graph.addNode(
                new GraphNode(
                    graph.getNextFreeNodeIndex(),
                    new app.b2Vec2(
                        midX + (col * cellWidth),
                        midY + (row * cellHeight)
                    )
                )
            );
        }
    }

    //now to calculate the edges. (A position in a 2d array [x][y] is the
    //same as [y * numCellsX + x] in a 1d array). Each cell has up to eight
    //neighbors.
    for (var row = 0; row < numCellsY; row++) {
        for (int col = 0; col < numCellsX; col++) {
          GraphHelper.addAllNeighborsToGridNode(graph, row, col, numCellsX, numCellsY);
        }
    }
};

goog.exportSymbol('GraphHelper', GraphHelper);
