'use strict';

exports.navigateSelectedNode = (scope, state, args, data, next) => {

    // if no node has been selected, select the node closest to the center of the screen
    let centerNode;
    if (!data.node) {
        centerNode = true;
        let canvas = state.network.canvas.frame.canvas;
        let center = state.network.DOMtoCanvas({
            x: canvas.offsetLeft + canvas.width / 2,
            y: canvas.offsetTop + canvas.height / 2
        });
        let distanceToCenter;

        Object.keys(state.nodes._data).forEach(nodeId => {
            let cNode = state.nodes._data[nodeId];
            let cPosition = state.network.getPositions(cNode.id);
            cNode.x = cPosition[cNode.id].x;
            cNode.y = cPosition[cNode.id].y;

            let distance = Math.sqrt((cNode.x - center.x)*(cNode.x - center.x) + (cNode.y - center.y)*(cNode.y - center.y));

            if (!distanceToCenter) {
                distanceToCenter = distance;
                data.node = cNode.id;
                return;
            }

            if (distance < distanceToCenter) {
                distanceToCenter = distance;
                data.node = cNode.id;
            }
        });
    }

    let node = state.nodes._data[data.node];
    if (!node) {
        return next(null, data);
    }

    // get all children siblings and parents to determine where to go next
    let parents = [];
    Object.keys(state.edges._data).forEach(edgeId => {
        let cEdge = state.edges._data[edgeId];

        // parents
        if (cEdge.to === node.id) {
            parents.push(cEdge.from);
        }
    });

    let children = [];
    let siblings = [];
    Object.keys(state.edges._data).forEach(edgeId => {
        let cEdge = state.edges._data[edgeId];

        // children
        if (cEdge.from === node.id) {
            let cNode = state.nodes.get(cEdge.to);
            if (cNode) {
                children.push(cNode);
            }
        }

        // siblings
        if (parents.indexOf(cEdge.from) > -1 && cEdge.to !== node.id) {
            let cNode = state.nodes.get(cEdge.to);
            if (cNode) {
                siblings.push(cNode);
            }
        }
    });

    // also add the parent to the children array
    if (parents.length && state.nodes._data[node.parent]) {
        parents.forEach(parentId => {
            let parent = state.nodes.get(parentId);
            if (parent) {
                children.push(parent);
            }
        });
    }

    // Use the curent node if it was selected from the center and it has no other nodes connected to it
    if (centerNode && !children.length && !siblings.length) {
        scope.flow(state.config.events.selectNode).write({node: node});
        return next(null, data);
    }

    // do not continue if we got no place to go
    if (!children.length && !siblings.length) {
        data.node = null;
        return next(null, data);
    }

    // get the real position of the selected node
    let position = state.network.getPositions(node.id);
    node.x = position[node.id].x;
    node.y = position[node.id].y;

    // check if any children are in navigable area
    let result = findSelectables(data.event.keyCode, state, node, children);

    // if no result so far look for siblings
    if (!result) {
        result = findSelectables(data.event.keyCode, state, node, siblings);
    }

    // if still no result look for children but with an increased distance
    if (!result) {
        result = findSelectables(data.event.keyCode, state, node, children.concat(siblings), 50);
    }

    if (!result) {
        return next(null, data);
    }

    scope.flow(state.config.events.selectNode).write({ node: result });
    next(null, data);
};

let findSelectables = (keyCode, state, node, candidates, distanceOffset) => {
    distanceOffset = distanceOffset || 0;

    // check if any candidates are in navigable area
    // we have 4 possible areas UP DOWN LEFT RIGHT
    // get the node that is the closest to the center of the required area as posible
    let result;
    let resultDistance;
    candidates.forEach(cNode => {
        // get the positions of the node
        let cPosition = state.network.getPositions(cNode.id);
        cNode.x = cPosition[cNode.id].x;
        cNode.y = cPosition[cNode.id].y;

        if (keyCode === 38) { // check in the UP area

            // here we must check agains the X axis
            // compute the X range the child node must be in based on the distance between the 2 nodes
            let distance = node.y - cNode.y + distanceOffset;
            let xBenchmarkLeft = node.x - distance;
            let xBenchmarkRight = node.x + distance;

            // check if the node is in the right area
            if (cNode.x >= xBenchmarkLeft && cNode.x <= xBenchmarkRight && cNode.y <= node.y) {
                // check if it is better than the current candidate
                let distanceToCenter = Math.sqrt((cNode.x - node.x)*(cNode.x - node.x) + (cNode.y - node.y)*(cNode.y - node.y));
                //let distanceToCenter = Math.abs(node.x - cNode.x);

                if (result) {
                    if (distanceToCenter < resultDistance) {
                        result = cNode;
                        resultDistance = distanceToCenter;
                    }
                } else {
                    result = cNode;
                    resultDistance = distanceToCenter;
                }
            }
        } else if (keyCode === 40) { // check in the DOWN area
            // same as UP
            // here we must check agains the X axis
            // compute the X range the child node must be in based on the distance between the 2 nodes
            let distance = cNode.y - node.y + distanceOffset;
            let xBenchmarkLeft = node.x - distance;
            let xBenchmarkRight = node.x + distance;

            // check if the node is in the right area
            if (cNode.x >= xBenchmarkLeft && cNode.x <= xBenchmarkRight && cNode.y >= node.y) {
                // check if it is better than the current candidate
                let distanceToCenter = Math.sqrt((cNode.x - node.x)*(cNode.x - node.x) + (cNode.y - node.y)*(cNode.y - node.y));
                //let distanceToCenter = Math.abs(node.x - cNode.x);

                if (result) {
                    if (distanceToCenter < resultDistance) {
                        result = cNode;
                        resultDistance = distanceToCenter;
                    }
                } else {
                    result = cNode;
                    resultDistance = distanceToCenter;
                }
            }
        } else if (keyCode === 37) { // check in the LEFT area
            // here we must check agains the Y axis
            // compute the Y range the child node must be in based on the distance between the 2 nodes
            let distance = node.x - cNode.x + distanceOffset;
            let yBenchmarkUp = node.y - distance;
            let yBenchmarkDown = node.y + distance;

            // check if the node is in the right area
            if (cNode.y <= yBenchmarkDown && cNode.y >= yBenchmarkUp && cNode.x <= node.x) {
                // check if it is better than the current candidate
                let distanceToCenter = Math.sqrt((cNode.x - node.x)*(cNode.x - node.x) + (cNode.y - node.y)*(cNode.y - node.y));
                //let distanceToCenter = Math.abs(node.y - cNode.y);

                if (result) {
                    if (distanceToCenter < resultDistance) {
                        result = cNode;
                        resultDistance = distanceToCenter;
                    }
                } else {
                    result = cNode;
                    resultDistance = distanceToCenter;
                }
            }
        } else if (keyCode === 39) { // check in the RIGHT area
            // same as LEFT
            // here we must check agains the Y axis
            // compute the Y range the child node must be in based on the distance between the 2 nodes
            let distance = cNode.x - node.x + distanceOffset;
            let yBenchmarkUp = node.y - distance;
            let yBenchmarkDown = node.y + distance;

            // check if the node is in the right area
            if (cNode.y <= yBenchmarkDown && cNode.y >= yBenchmarkUp && cNode.x >= node.x) {
                // check if it is better than the current candidate
                let distanceToCenter = Math.sqrt((cNode.x - node.x)*(cNode.x - node.x) + (cNode.y - node.y)*(cNode.y - node.y));
                //let distanceToCenter = Math.abs(node.y - cNode.y);

                if (result) {
                    if (distanceToCenter < resultDistance) {
                        result = cNode;
                        resultDistance = distanceToCenter;
                    }
                } else {
                    result = cNode;
                    resultDistance = distanceToCenter;
                }
            }
        }
    });

    return result;
}
