'use strict';

const Parser = require('./lib/parser');
const Interaction = require('./lib/interaction');

exports.init = function (scope, state, args, data, next) {

    if (!args.parse) {
        return next(new Error('Flow-visualizer.init: No parse config found.'));
    }

    if (!args.events) {
        return next(new Error('Flow-visualizer.init: No event interface config found.'));
    }

    state.event_if = args.events;

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

    state.index = {
        nodes: {},
        edges: {}
    };
    state.types = args.types || {};
    state.predicates = args.parse;
    state.nodes = new vis.DataSet(args.nodes || []);
    state.edges = new vis.DataSet(args.edges || []);

    if (!(state.view = document.querySelector(args.view))) {
        return next(new Error('Flow-visualizer: DOM data.node not found.'));
    }

    state.network = new vis.Network(state.view, {
        nodes: state.nodes,
        edges: state.edges
    }, args.vis);

    // TODO create event to sequence args
    Interaction(scope, state, args.interaction);

    next(null, data);
};

exports.parse = function (scope, state, args, data, next) {

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

    data.node = data.node || {id: ''};

    const pos = {x: 0, y: 0};
    if (data.node) {
        pos.x = data.node.x || 0;
        pos.y = data.node.y || 0;
        pos.l = state.network.getBoundingBox(data.node.id) || {top: 0, left: 0, bottom: 0, right: 0};
        pos.l = Math.sqrt(Math.pow(pos.l.top - pos.l.bottom, 2) + Math.pow(pos.l.right - pos.l.left, 2));
        pos.parent = data.node.parent ? state.network.getPositions(data.node.parent)[data.node.parent] : {x: 0, y: 0};
    }

    Parser(state.predicates, triples, state.types, data, pos, state.index);

    next(null, data);
};

exports.add = function (scope, state, args, data, next) {

    if (!args.nodes && !args.edges && !data.nodes && !data.edges) {
        return next(new Error('Flow-visualizer.add: No nodes or edges found.'));
    }

    data.nodes && state.nodes.add(data.nodes);
    data.edges && state.edges.add(data.edges);

    scope.flow(state.event_if.dataChange).write({ nodes: state.nodes._data, edges: state.edges._data });

    next(null, data);
};

exports.remove = function (scope, state, args, data, next) {

    let nodes = [];
    let edges = [];
    const index = state.index;
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
        state.nodes.remove(nodes);
    }

    if (edges.length) {
        state.edges.remove(edges);
    }

    next(null, data);
};

exports.reset = function (scope, state, args, data, next) {

    state.network.setData({
        nodes: data.nodes || [],
        edges: data.edges || []
    });

    next(null, data);
};

exports.focus = function (scope, state, args, data, next) {

    if (!data.node) {
        return next(new Error('Flow-visualizer.add: No node provided.'));
    }

    state.network.focus(data.node, {
        scale: 1
    });
    state.network.setSelection({ nodes: [data.node] }, { unselectAll: true });

    next(null, data);
};
