"use strict";

const Parser = require("./lib/Parser");
const Manipulation = require("./lib/Manipulation");
const Interaction = require("./lib/Interaction");
const Context = require("./lib/context");
const Navigation = require("./lib/navigation");

const visInstances = {};
function getVisualization (name, config) {

    if (visInstances[name]) {
        return visInstance[name];
    } else {
        visInstance[name] = Visualizer(config);
    }
}

exports.getVis = function (scope, state, args, data, next) {

    data.vis = getVisualization(data.name || args.name, args.vis);

    if (!(state.config.view = document.querySelector(args.view))) {
        return next(new Error("Flow-visualizer: DOM target not found."));
    }

    state.index = {
        nodes: {},
        edges: {}
    };

    state.nodes = new vis.DataSet([]);
    state.edges = new vis.DataSet([]); 

    state.network = new vis.Network(state.config.view, {
        nodes: state.nodes,
        edges: state.edges
    }, state.visConfig);

    // TODO set selected nodes and edges on state
    Interaction.init(scope, state);
    //Context.init(scope, state);

    next(null, data);
};

exports.focus = (scope, state, args, data, next) => {

    if (!true) {
        return new Error();
    }

    return Stream.Transform({
        transform: (chunk, next) => {
            if (!data.vis || !data.vis.focus) {
                return;
            }

            data.vis.focus();
        }
    })
};

// TODO buttons
exports.context = function (scope, state, args, data, next) {

    if (!data.node) {
        return next(new Error("Flow-visualizer.context: No node provided."));
        //return next(null, data);
    }

    Context.toggle(state, data.node);

    next(null, data);
};

// TODO remove this method, when selected nodes and edges are saved on the state
// ..navigation uses this function
exports.getSelectedNode = function (scope, state, args, data, next) {

    let selectedNodes = state.network.getSelectedNodes();
    data.node = (selectedNodes && selectedNodes.length) ? selectedNodes[0] : null;

    next(null, data);
};

/* Export Navigation methods */
exports.navigateSelectedNode = Navigation.navigateSelectedNode;

/* Export Interaction methods */
// ..animations and user events
exports.focus = Interaction.focus;
exports.expandCollapse = Interaction.expandCollapse;
exports.changeFocusZoom = Interaction.changeFocusZoom;
