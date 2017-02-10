"use strict"

// TODO move parse, add, remove and reset into a separate file data.js
exports.add = function (scope, state, args, data, next) {

    if (!args.nodes && !args.edges && !data.nodes && !data.edges) {
        return next(new Error('Flow-visualizer.add: No nodes or edges found.'));
    }

    data.nodes && state.nodes.add(data.nodes);
    data.edges && state.edges.add(data.edges);

    // emit data change event
    if (state.config.events.dataChange) {
        scope.flow(state.config.events.dataChange).write({
            nodes: state.nodes._data,
            edges: state.edges._data
        });
    }

    next(null, data);
};

exports.remove = function (scope, state, args, data, next) {

    let nodes = [];
    let edges = [];
    const index = state.index;
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

    if (data.node && data.node.id) {
        getChildren(data.node.id);
        index.nodes[data.node.id].children = [];
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
