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

    // get all children and siblings to determine where to go next
    let children = [];
    let siblings = [];
    Object.keys(state.nodes._data).forEach(nodeId => {
        let cNode = state.nodes._data[nodeId];

        // children
        if (cNode.parent === node.id) {
            children.push(cNode);
        }

        // siblings
        if (node.parent && cNode.id !== node.id && node.parent === cNode.parent) {
            siblings.push(cNode);
        }
    });

    // also add the parent to the children array
    if (node.parent && state.nodes._data[node.parent]) {
        children.push(state.nodes._data[node.parent]);
    }

    // Use the curent node if it was selected from the center and it has no other nodes connected to it
    if (centerNode && !children.length && !siblings.length) {
        scope.flow(state.event_if.selectNode).write({node: node});
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

    // if no result so far look in the siblings array
    if (!result) {
        result = findSelectables(data.event.keyCode, state, node, siblings);
    }

    if (!result) {
        return next(null, data);
    }

    scope.flow(state.event_if.selectNode).write({ node: result });
    next(null, data);
};

let findSelectables = (keyCode, state, node, candidates) => {

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
            let distance = node.y - cNode.y;
            let xBenchmarkLeft = node.x - distance;
            let xBenchmarkRight = node.x + distance;

            // check if the node is in the right area
            if (cNode.x >= xBenchmarkLeft && cNode.x <= xBenchmarkRight && cNode.y <= node.y) {
                // check if it is better than the current candidate
                let distanceToCenter = Math.sqrt((cNode.x - node.x)*(cNode.x - node.x) + (cNode.y - node.y)*(cNode.y - node.y));

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
            let distance = cNode.y - node.y;
            let xBenchmarkLeft = node.x - distance;
            let xBenchmarkRight = node.x + distance;

            // check if the node is in the right area
            if (cNode.x >= xBenchmarkLeft && cNode.x <= xBenchmarkRight && cNode.y >= node.y) {
                // check if it is better than the current candidate
                let distanceToCenter = Math.sqrt((cNode.x - node.x)*(cNode.x - node.x) + (cNode.y - node.y)*(cNode.y - node.y));

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
            let distance = node.x - cNode.x;
            let yBenchmarkUp = node.y - distance;
            let yBenchmarkDown = node.y + distance;

            // check if the node is in the right area
            if (cNode.y <= yBenchmarkDown && cNode.y >= yBenchmarkUp && cNode.x <= node.x) {
                // check if it is better than the current candidate
                let distanceToCenter = Math.sqrt((cNode.x - node.x)*(cNode.x - node.x) + (cNode.y - node.y)*(cNode.y - node.y));

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
            let distance = cNode.x - node.x;
            let yBenchmarkUp = node.y - distance;
            let yBenchmarkDown = node.y + distance;

            // check if the node is in the right area
            if (cNode.y <= yBenchmarkDown && cNode.y >= yBenchmarkUp && cNode.x >= node.x) {
                // check if it is better than the current candidate
                let distanceToCenter = Math.sqrt((cNode.x - node.x)*(cNode.x - node.x) + (cNode.y - node.y)*(cNode.y - node.y));

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