'use strict';

function Navigation (vis)  {
    this.vis = vis;
};

Navigation.prototype.navigate = function (direction, nodeId) {
    var self = this;

    // if no node has been selected, select the node closest to the center of the screen
    let centerNode;
    if (!nodeId) {
        centerNode = true;
        let canvas = self.vis.network.canvas.frame.canvas;
        let center = self.vis.network.DOMtoCanvas({
            x: canvas.offsetLeft + canvas.width / 2,
            y: canvas.offsetTop + canvas.height / 2
        });
        let distanceToCenter;

        Object.keys(self.vis.nodes._data).forEach(cNodeId => {
            let cNode = self.vis.nodes._data[cNodeId];
            let cPosition = self.vis.network.getPositions(cNode.id);
            cNode.x = cPosition[cNode.id].x;
            cNode.y = cPosition[cNode.id].y;

            let distance = Math.sqrt((cNode.x - center.x)*(cNode.x - center.x) + (cNode.y - center.y)*(cNode.y - center.y));

            if (!distanceToCenter) {
                distanceToCenter = distance;
                nodeId = cNode.id;
                return;
            }

            if (distance < distanceToCenter) {
                distanceToCenter = distance;
                nodeId = cNode.id;
            }
        });
    }

    let node = self.vis.nodes._data[nodeId];
    if (!node) {
        return;
    }

    // get all children siblings and parents to determine where to go next
    let parents = [];
    Object.keys(self.vis.edges._data).forEach(edgeId => {
        let cEdge = self.vis.edges._data[edgeId];

        // parents
        if (cEdge.to === node.id) {
            parents.push(cEdge.from);
        }
    });

    let children = [];
    let siblings = [];
    Object.keys(self.vis.edges._data).forEach(edgeId => {
        let cEdge = self.vis.edges._data[edgeId];

        // children
        if (cEdge.from === node.id) {
            let cNode = self.vis.nodes.get(cEdge.to);
            if (cNode) {
                children.push(cNode);
            }
        }

        // siblings
        if (parents.indexOf(cEdge.from) > -1 && cEdge.to !== node.id) {
            let cNode = self.vis.nodes.get(cEdge.to);
            if (cNode) {
                siblings.push(cNode);
            }
        }
    });

    // also add the parent to the children array
    if (parents.length && self.vis.nodes._data[node.parent]) {
        parents.forEach(parentId => {
            let parent = self.vis.nodes.get(parentId);
            if (parent) {
                children.push(parent);
            }
        });
    }

    // Use the curent node if it was selected from the center and it has no other nodes connected to it
    if (centerNode && !children.length && !siblings.length) {
        return node;
    }

    // do not continue if we got no place to go
    if (!children.length && !siblings.length) {
        return;
    }

    // get the real position of the selected node
    let position = self.vis.network.getPositions(node.id);
    node.x = position[node.id].x;
    node.y = position[node.id].y;

    // check if any children are in navigable area
    let result = findSelectables(direction, self.vis, node, children);

    // if no result so far look for siblings
    if (!result) {
        result = findSelectables(direction, self.vis, node, siblings);
    }

    // if still no result look for children but with an increased distance
    if (!result) {
        result = findSelectables(direction, self.vis, node, children.concat(siblings), 50);
    }

    if (!result) {
        return;
    }

    return result;
};

function findSelectables (direction, vis, node, candidates, distanceOffset) {
    distanceOffset = distanceOffset || 0;

    // check if any candidates are in navigable area
    // we have 4 possible areas UP DOWN LEFT RIGHT
    // get the node that is the closest to the center of the required area as posible
    let result;
    let resultDistance;
    candidates.forEach(cNode => {
        // get the positions of the node
        let cPosition = vis.network.getPositions(cNode.id);
        cNode.x = cPosition[cNode.id].x;
        cNode.y = cPosition[cNode.id].y;

        if (direction === 'up') { // check in the UP area

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
        } else if (direction === 'down') { // check in the DOWN area
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
        } else if (direction === 'left') { // check in the LEFT area
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
        } else if (direction === 'right') { // check in the RIGHT area
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

module.exports = Navigation;