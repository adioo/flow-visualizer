'use strict';

// Dependencies
const vis = require('vis');


function Visualization (options) {

    this.nodes = new vis.DataSet(options.nodes || []);
    this.edges = new vis.DataSet(options.edges || []);
    this.view = options.view || '.graph';

    this.network = new vis.Network(this.view, {
        nodes: this.nodes,
        edges: this.edges
    }, options.vis);
};

module.exports = Visualization;