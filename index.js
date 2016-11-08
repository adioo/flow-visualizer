'use strict';

const Parser = require('./lib/parser');
const Interaction = require('./lib/interaction');

exports.init = function (scope, inst, args, data, next) {

    if (!args.parse) {
        return next(new Error('Flow-visualizer.init: No parse config found.'));
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

    inst.index = {
        nodes: [],
        edges: []
    };
    inst.types = args.types || {};
    inst.predicates = args.parse;
    inst.nodes = new vis.DataSet(args.nodes || []);
    inst.edges = new vis.DataSet(args.edges || []);

    if (!(inst.view = document.querySelector(args.view))) {
        return next(new Error('Flow-visualizer: DOM target not found.'));
    }

    inst.network = new vis.Network(inst.view, {
        nodes: inst.nodes,
        edges: inst.edges
    }, args.vis);

    Interaction(scope, inst, args.interaction);

    next(null, data);
};

exports.parse = function (scope, inst, args, data, next) {

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
        pos.l = inst.network.getBoundingBox(data.node.id);
        pos.l = Math.sqrt(Math.pow(pos.l.top - pos.l.bottom, 2) + Math.pow(pos.l.right - pos.l.left, 2));
        pos.parent = data.node.parent ? inst.network.getPositions(data.node.parent)[data.node.parent] : {x: 0, y: 0};
    }

    Parser(inst.predicates, triples, inst.types, data, pos, inst.index);

    next(null, data);
};

exports.add = function (scope, inst, args, data, next) {

    if (!args.nodes && !args.edges && !data.nodes && !data.edges) {
        return next(new Error('Flow-visualizer.add: No nodes or edges found.'));
    }

    data.nodes && inst.nodes.add(data.nodes);
    data.edges && inst.edges.add(data.edges);

    scope.flow(inst._name + '/dataChanged').write({ nodes: inst.nodes._data, edges: inst.edges._data });

    next(null, data);
};

exports.remove = function (scope, inst, args, data, next) {

    let nodes = [];
    let edges = [];
    const index = inst.index;
    const getChildren = (id) => {
        if (index.nodes[id]) { 
            index.nodes[id].out.forEach(edge => {
                edges.push(edge);
                index.edges[edge] = null;
            });
            index.nodes[id].children.forEach(_id => {
                nodes.push(_id);
                getChildren(_id);
                index.nodes[_id] = null;//{children: [], out: []};
            });
        }
    };

    if (data.node && data.node.id) {
        getChildren(data.node.id);
        index.nodes[data.node.id] = null;//{children: [], out: []};
        inst.nodes.remove(nodes);
    }

    if (edges.length) {
        inst.edges.remove(edges);
    }

    next(null, data);
};

exports.reset = function (scope, inst, args, data, next) {

    inst.network.setData({
        nodes: data.nodes || [],
        edges: data.edges || []
    });

    next(null, data);
};

exports.focus = function (scope, inst, args, data, next) {

    if (!data.node) {
        return next(new Error('Flow-visualizer.add: No node provided.'));
    }

    inst.network.focus(data.node, {
        scale: 1
    });
    inst.network.setSelection({ nodes: [data.node] }, { unselectAll: true });

    next(null, data);
};
