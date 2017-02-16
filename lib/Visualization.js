'use strict';

// Dependencies
const vis = require('vis');


function Visualization (options) {

    this.nodes = new vis.DataSet(options.nodes || []);
    this.edges = new vis.DataSet(options.edges || []);
    this.view = document.querySelector(options.view || '.graph');

    this.index = {
        nodes: {},
        edges: {}
    };

    this.network = new vis.Network(this.view, {
        nodes: this.nodes,
        edges: this.edges
    }, options.vis);
}

Visualization.prototype.getSelectedNode = function () {

    let selectedNodes = this.network.getSelectedNodes();
    let node = (selectedNodes && selectedNodes.length) ? selectedNodes[0] : null;

    return node;
};

module.exports = Visualization;