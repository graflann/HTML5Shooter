goog.provide('GraphHelper');

goog.require('NavConstants');
goog.require('GraphNode');
goog.require('GraphEdge');

GraphHelper = new Object();

GraphHelper.isValidNeighbor = function(x, y, numCellsX, numCellsY) {
    return !(x < 0 || x >= numCellsX || y < 0 || y >= numCellsY);
};

GraphHelper.addAllNeighborsToGridNode = function(graph, row, col, numCellsX, numCellsY) {
    for (var i = -1; i < 2; ++i) {
        for (var j = -1; j < 2; ++j) {
            var nodeX = col + j,
                nodeY = row + i;

            //skip if equal to this node
            if (i === 0 && j === 0) {
                continue;
            }

            //check to see if this is a valid neighbour
            if (GraphHelper.isValidNeighbor(nodeX, nodeY, numCellsX, numCellsY)) {

                //calculate the distance to this node
                var value               = (row * numCellsX) + col,
                    neighborValue       = (nodeY * numCellsX) + nodeX,
                    nodePos             = graph.getNode(value).position,
                    nodeNeighborPos     = graph.getNode(neighborValue).position,
                    distance            = nodePos.Distance(nodeNeighborPos);

                graph.addEdge(new GraphEdge(value, neighborValue, distance));
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
        for (var col = 0; col < numCellsX; col++) {
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
        for (var col = 0; col < numCellsX; col++) {
          GraphHelper.addAllNeighborsToGridNode(graph, row, col, numCellsX, numCellsY);
        }
    }
};

GraphHelper.drawGrid = function(graph, sourceIndex, targetIndex, path) {
    var i = 0, 
        j = 0,
        length = graph.nodeLength(),
        node = null,
        pos = null,
        shape = null,
        text = null,
        label = "",
        stage = app.layers.getStage(LayerTypes.MAIN),
        color = "";

    //render all graph nodes
    for(i; i < length; i++) {
        node = graph.getNode(i);
        pos = node.position;

        shape = new createjs.Shape();

        if(node === graph.getNode(sourceIndex)) {
            color = Constants.GREEN;
        } else if(node === graph.getNode(targetIndex)) {
            color = Constants.BRIGHT_RED;
        } else {
            color = Constants.LIGHT_BLUE;
        }

        shape.graphics
            .f(color)
            .dc(0, 0, 2);

        shape.x = pos.x;
        shape.y = pos.y;

        label = i.toString();
        text = new createjs.Text(label, "8px AXI_Fixed_Caps_5x5", Constants.LIGHT_BLUE);
        text.x = shape.x - (label.length * 3);
        text.y = shape.y + 4;

        stage.addChild(shape);
        stage.addChild(text);
    }

    length = path.length;

    //render overlying nodes identifying the path from source to target
    for(i = 0; i < length; i++) {
        node = graph.getNode(path[i]);
        pos = node.position;

        shape = new createjs.Shape();
        shape.graphics
            .f(Constants.YELLOW)
            .dc(0, 0, 8);

        shape.x = pos.x;
        shape.y = pos.y;
        shape.alpha = 0.25;

        stage.addChild(shape);
    }
};

GraphHelper.createShortestPathTable = function(graph) {
    var length = graph.nodeLength(),
        arrRow = new Array(length),
        arrShortestPaths = new Array(length),
        arrShortestPath = null,
        i = 0,
        sourceIndex = 0,
        targetIndex = 0,
        nodeIndex = 0,
        search = new AStartSearch(graph, 0);

    for(i = 0; i < length; i++) {
        arrRow[i] = NavConstants.INVALID_NODE_INDEX;
    }

    for(i = 0; i < length; i++) {
        arrShortestPaths[i] = arrRow.slice(0);
    }

    for (sourceIndex = 0; sourceIndex < length; ++sourceIndex) {
        //calculate the SPT for this node
        //Graph_SearchDijkstra<graph_type> search(G, source);
        
        search.sourceIndex = sourceIndex;
        arrShortestPath = search.getShortestPath();

        //now we have the shortest path it's easy to work backwards through it to find
        //the shortest paths from each node to this source node
        for (targetIndex = 0; targetIndex < length; ++targetIndex) {
            //if the source node is the same as the target just set to target
            if (sourceIndex == targetIndex) {
                arrShortestPaths[sourceIndex][targetIndex] = targetIndex;
            } else {
                nodeIndex = targetIndex;

                while (nodeIndex != sourceIndex && arrShortestPath[nodeIndex] != 0) {
                  arrShortestPaths[arrShortestPath[nodeIndex].nodeTo][targetIndex] = nodeIndex;

                  nodeIndex = arrShortestPath[nodeIndex].nodeFrom;
                }
            }
        }//next target node
    }//next source node

    return arrShortestPaths;
};

goog.exportSymbol('GraphHelper', GraphHelper);
