'use strict';

const VIS = require('./index');

exports.init = (scope, state, args, data, next) => {

    if (!args.parse) {
        return next(new Error('Flow-visualizer.init: No parse config found.'));
    }

    if (!args.events) {
        return next(new Error('Flow-visualizer.init: No event interface config found.'));
    }

    if (!args.view || !document.querySelector(args.view)) {
        return next(new Error('Flow-visualizer: DOM data.node not found.'));
    }

    state.VIS = new VIS(args);
    state.events = args.events;

    // setup event interface
    // TODO this is temporary
    Object.keys(state.events).forEach(eventName => {
        state.VIS.interaction.on(eventName, eventData => {
            scope.flow(state.events[eventName]).write(eventData);
        });
    });

    return next(null, data);
};

exports.add = (scope, state, args, data, next) => {

    if (!args.nodes && !args.edges && !data.nodes && !data.edges) {
        return next(new Error('Flow-visualizer.add: No nodes or edges provided.'));
    }

    state.VIS.manipulation.add({
        nodes: data.nodes || args.nodes,
        edges: data.edges || args.edges
    });

    return next(null, data);
};

exports.remove = (scope, state, args, data, next) => {

    if (!data.node || !data.node.id) {
        return next(new Error('Flow-visualizer.remove: No node provided.'));
    }

    state.VIS.manipulation.remove(data.node.id);

    return next(null, data);
};

exports.reset = (scope, state, args, data, next) => {

    state.VIS.manipulation.reset();
    return next(null, data);
};

exports.parse = (scope, state, args, data, next) => {

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

    let result = state.VIS.parse(triples, data.node, args.onlyParse);

    if (result instanceof Error) {
        return next(result);
    }

    data.nodes = result.nodes;
    data.edges = result.edges;

    return next(null, data);
};

exports.focus = (scope, state, args, data, next) => {

    let nodeId = data.focusTo || (data.node ? (data.node.id || data.node) : null);
    if (!nodeId) {
        return next(new Error('Flow-visualizer.focus: No node provided.'));
    }

    // look in the data object for a custom scale value
    if (data.scale) {
        args.scale = data.scale;
    }

    state.VIS.interaction.focus(nodeId, args);

    return next(null, data);
};

exports.zoom = (scope, state, args, data, next) => {

    state.VIS.interaction.zoom(args);
    return next(null, data);
};

exports.expandCollapse = (scope, state, args, data, next) => {

    let nodeId = data.node ? (data.node.id || data.node) : null;
    if (!nodeId) {
        return next(new Error('Flow-visualizer.expandCollapse: No node provided.'));
    }

    state.VIS.interaction.expandCollapse(nodeId);
    return next(null, data);
};

exports.select = (scope, state, args, data, next) => {

    return next(null, data);
};

exports.getSelectedNode = (scope, state, args, data, next) => {

    let node = state.VIS.visualization.getSelectedNode();
    data.node = node;

    return next(null, data);
};

exports.navigate = (scope, state, args, data, next) => {

    let nodeId = data.node ? (data.node.id || data.node) : null;

    if (!data.event || !data.event.keyCode) {
        return next(new Error('Flow-visualizer.navigate: No keyCode provided.'));
    }

    let direction;
    switch (data.event.keyCode) {
        case 37:
            direction = 'left';
            break;
        case 38:
            direction = 'up';
            break;
        case 39:
            direction = 'right';
            break;
        case 40:
            direction = 'down';
    };

    if (!direction) {
        return next(new Error('Flow-visualizer.navigate: Invalid direction provided.'));
    }

    let result = state.VIS.navigation.navigate(direction, nodeId);
    if (result) {
        scope.flow(state.events.navigationNode).write({node: result});
    }

    return next(null, data);
};