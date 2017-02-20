'use strict';

function Manipulation (vis) {
    this.vis = vis;
};

Manipulation.prototype.add = function (data) {

    // only add nodes that do not already exist
    let nodes = [];
    data.nodes.forEach(node => {
        let exists = this.vis.nodes.get(node.id);
        if (!exists) {
            nodes.push(node);
        }
    });

    this.vis.nodes.add(nodes);
    this.vis.edges.add(data.edges || []);
};

Manipulation.prototype.remove = function (nodeId) {

    let nodes = [];
    let edges = [];
    const index = this.vis.index;

    const getChildren = (id) => {
        if (index.nodes[id]) {

            // remove edges
            index.nodes[id].o.forEach(edge => {
                edges.push(edge);
                index.edges[edge] = null;
            });

            // remove nodes
            index.nodes[id].children.forEach(_id => {
                if (index.nodes[_id] && (index.nodes[_id].i === 0 || --index.nodes[_id].i === 0)) {
                    getChildren(_id);
                    nodes.push(_id);
                    index.nodes[_id] = null;
                }
            });
        }
    };

    getChildren(nodeId);
    index.nodes[nodeId].children = [];
    this.vis.nodes.remove(nodes);

    if (edges.length) {
        this.vis.edges.remove(edges);
    }
};

Manipulation.prototype.reset = function (data) {

    this.vis.network.setData({
        nodes: data.nodes || [],
        edges: data.edges || []
    });
};

module.exports = Manipulation;