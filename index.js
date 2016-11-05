'use strict';

const Parser = require('./lib/parser');
const Interaction = require('./lib/interaction');

exports.init = function (args, ready) {

    if (!args.parse) {
        return ready(new Error('Flow-visualizer.init: No parse config found.'));
    }

    args.vis = Object.assign({
        nodes: {
            shape: 'dot',
            scaling: { min: 20,max: 30,
                label: { min: 14, max: 30, drawThreshold: 9, maxVisible: 20 }
            },
            font: {size: 14, face: 'Helvetica Neue, Helvetica, Arial'}
        },
        interaction: {
            hover: true,
            hoverConnectedEdges: false,
            selectConnectedEdges: true
        }
    }, args.vis || {});

    this.index = {};
    this.types = args.types || {};
    this.predicates = args.parse;
    this.nodes = new vis.DataSet(args.nodes || []);
    this.edges = new vis.DataSet(args.edges || []);

    if (!(this.view = document.querySelector(args.view))) {
        return ready(new Error('Flow-visualizer: DOM target not found.'));
    }

    this.network = new vis.Network(this.view, {
        nodes: this.nodes,
        edges: this.edges
    }, args.vis);

    Interaction(this, args.interaction);

    ready();
};

exports.parse = function (args, data, next) {

    let triples;
    if (!(data instanceof Array) && args.key && data[args.key]) {
        triples = data[args.key];
        data.nodes = [];
        data.edges = [];
    } else {
        triples = data;
        data = {
            nodes: [],
            edges: []
        };
    }

    const pos = {x: 0, y: 0};
    if (data.node) {
        pos.x = data.node.x || 0;
        pos.y = data.node.y || 0;
        pos.l = this.network.getBoundingBox(data.node.id);
        pos.l = Math.sqrt(Math.pow(pos.l.top - pos.l.bottom, 2) + Math.pow(pos.l.right - pos.l.left, 2));
        pos.parent = data.node.parent ? this.network.getPositions(data.node.parent)[data.node.parent] : {x: 0, y: 0};
    }

    Parser(this.predicates, triples, this.types, data, pos, this.index);

    next(null, data);
};

exports.add = function (args, data, next) {

    if (!args.nodes && !args.edges && !data.nodes && !data.edges) {
        return next(new Error('Flow-visualizer.add: No nodes or edges found.'));
    }

    data.nodes && this.nodes.add(data.nodes);
    data.edges && this.edges.add(data.edges);

    this.flow(this._name + '/dataChanged').write({ nodes: this.nodes._data, edges: this.edges._data });

    next(null, data);
};

exports.remove = function (args, data, next) {
    const self = this;

    /*self.nodes.forEach(node => {
        node.type === 'module' && self.nodes.remove(node.id);
        self.index = 0;
    });*/

    this.nodes.clear();
    this.edges.clear();
    this.nodes.add({
        id: 'p_service',
        label: 'Service',
        shape: 'circle',
        type: 'project'
    });
    this.index = {};
    next(null, data);
};

exports.reset = function (args, data, next) {

    this.network.setData({
        nodes: data.nodes || [],
        edges: data.edges || []
    });

    next(null, data);
};

exports.focus = function (args, data, next) {

    if (!data.node) {
        return next(new Error('Flow-visualizer.add: No node provided.'));
    }

    this.network.focus(data.node, {
        scale: 1
    });
    this.network.setSelection({ nodes: [data.node] }, { unselectAll: true });

    next(null, data);
};
