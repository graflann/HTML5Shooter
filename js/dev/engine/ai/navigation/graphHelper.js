goog.provide('GraphHelper');

goog.require('NavConstants');
goog.require('GraphNode');
goog.require('GraphEdge');
goog.require('AStarSearch');
goog.require('LayerTypes');

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

                //calculate the distance from this node to its neighbors
                var value               = (row * numCellsX) + col,
                    neighborValue       = (nodeY * numCellsX) + nodeX,
                    nodePos             = graph.getNode(value).position,
                    nodeNeighborPos     = graph.getNode(neighborValue).position,
                    distance            = nodePos.DistanceSqrd(nodeNeighborPos);

                graph.addEdge(new GraphEdge(value, neighborValue, distance));
            }
        }
    }
};

GraphHelper.createGrid = function(graph, levelW, levelH, numCellsX, numCellsY, arrSceneObjects) {
    var cellWidth   = levelW / numCellsX,
        cellHeight  = levelH / numCellsY,
        midX        = cellWidth * 0.5,
        midY        = cellHeight * 0.5,
        node = null,
        sceneObject,
        x = 0, 
        y = 0,
        soRect = new createjs.Rectangle(),
        nodeRect = new createjs.Rectangle(),
        offset = Constants.UNIT * 0.5;
        isInvalid  = false,
        length = 0;

    //first create all the nodes
    for (var row = 0; row < numCellsY; row++) {
        for (var col = 0; col < numCellsX; col++) {
            x = midX + (col * cellWidth);
            y = midY + (row * cellHeight);

            graph.addNode(
                new GraphNode(
                    graph.getNextFreeNodeIndex(),
                    new app.b2Vec2(x, y)
                )
            );
        }
    }

    //now to calculate the edges. (A position in a 2d array [x][y] is the
    //same as [y * numCellsX + x] in a 1d array). Each cell has up to eight neighbors.
    for (var row = 0; row < numCellsY; row++) {
        for (var col = 0; col < numCellsX; col++) {
            GraphHelper.addAllNeighborsToGridNode(graph, row, col, numCellsX, numCellsY);
        }
    }

    //removes any node obfuscated by a SceneObject instance
    if(arrSceneObjects) {
        length = graph.nodeLength();

        for(var i = 0; i < length; i++) {
            for(var j = 0; j < arrSceneObjects.length; j++) {
                sceneObject = arrSceneObjects[j];

                node = graph.getNode(i); 

                //set sceneObject dims to Rectangle instance
                soRect.x        = sceneObject.x;
                soRect.width    = sceneObject.width;
                soRect.y        = sceneObject.y;
                soRect.height   = sceneObject.height;

                //set node area dims to Rectangle instance
                nodeRect.x      = node.position.x - offset;
                nodeRect.width  = Constants.UNIT;
                nodeRect.y      = node.position.y - offset;
                nodeRect.height = Constants.UNIT;

                //if node area is intersected by sceneObject footprint the node is invalidated
                if(soRect.intersectPoint(node.position.x, node.position.y) || nodeRect.intersect(soRect)) {
                    graph.removeNode(i);

                    //debugging visual displaying affected area due to node removal
                    var shape = new createjs.Shape();
                    shape.graphics
                        .f(Constants.RED)
                        .dr(nodeRect.x, nodeRect.y, nodeRect.width, nodeRect.height);

                    shape.x = 0;
                    shape.y = 0;
                    shape.alpha = 0.5;

                    app.layers.getStage(LayerTypes.FOREGROUND).addChild(shape);

                    break;
                }
            }
        }
    }
};

GraphHelper.drawGrid = function(layerType, graph, sourceIndex, targetIndex, path, shortestPath) {
    var i = 0, 
        j = 0,
        node = null,
        edge = null,
        prevNode = null,
        edge = null,
        pos = null,
        prevPos = null,
        shape = null,
        text = null,
        label = "",
        stage = app.layers.getStage(layerType),
        color = "";

    //render path tree=
    for(var index in shortestPath) {
        if(shortestPath[index]) {
            edge = shortestPath[index];

            if(edge) {
                node = graph.getNode(edge.nodeTo);
                prevNode = graph.getNode(edge.nodeFrom);
                pos = node.position;
                prevPos = prevNode.position;

                shape = new createjs.Shape();
                shape.graphics
                    .s(Constants.LIGHT_BLUE)
                    .ss(1)
                    .mt(pos.x, pos.y)
                    .lt(prevPos.x, prevPos.y);

                shape.x = 0;
                shape.y = 0;
                shape.alpha = 0.5;

                stage.addChild(shape);
            }
        }
    }

    //render overlying nodes identifying the path from source to target
    for(i = 0; i < path.length; i++) {
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

    shape = new createjs.Shape();
    //render all graph nodes
    for(i = 0; i < graph.nodeLength(); i++) {
        node = graph.getNode(i);
        pos = node.position;

        // shape = new createjs.Shape();

        if(node === graph.getNode(sourceIndex)) {
            color = Constants.GREEN;
        } else if(node === graph.getNode(targetIndex)) {
            color = Constants.BRIGHT_RED;
        } else {
            color = Constants.LIGHT_BLUE;
        }

        shape.graphics
            .f(color)
            .dc(pos.x, pos.y, 2);
        shape.snapToPixel = true;

        //shape.x = pos.x;
        //shape.y = pos.y;
        
        if(node.index < 0) {
            label = i.toString() + "\n" + node.index.toString();
        } else {
            label = node.index.toString();
        }

        text = new createjs.Text(label, "8px AXI_Fixed_Caps_5x5", Constants.LIGHT_BLUE);
        text.x = pos.x - (label.length * 3);
        text.y = pos.y + 4;

        //stage.addChild(shape);
        stage.addChild(text);
    }

    stage.addChild(shape);
};

GraphHelper.createPathTable = function(graph) {
    var sourceIndex = 0,
        targetIndex = 0,
        length = graph.nodeLength(),
        arrPaths = new Array(graph.nodeLength()),
        searchAlgorithm = new AStarSearch(graph, sourceIndex, targetIndex);

    for(sourceIndex; sourceIndex < length; sourceIndex++) {
        searchAlgorithm.sourceIndex = sourceIndex;
        targetIndex = 0;

        arrPaths[sourceIndex] = [];

        for(targetIndex; targetIndex < length; targetIndex++) {
            searchAlgorithm.targetIndex = targetIndex;

            searchAlgorithm.search();

            arrPaths[sourceIndex][targetIndex] = searchAlgorithm.getPathToTarget();

            searchAlgorithm.arrShortestPath.length = 0;
            searchAlgorithm.arrSearchFrontier.length = 0;
        }
    }

    return arrPaths;
};

goog.exportSymbol('GraphHelper', GraphHelper);
