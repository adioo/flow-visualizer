'use strict'

const isTouchDevice = 'd' in document.documentElement;

exports.init = (scope, state) => {

    const network = state.network;
    const events = state.config.events || {};
    const threshold = 200;
    state.eventTime = 0;

    // Click > Expand/Collaps sub tree
    network.on('click', event => {
        let t = new Date();
        setTimeout(() => {
            if (t - state.eventTime > threshold) {

                // show context menu on node
                const node = event.nodes.length ? state.nodes.get(event.nodes[0]) : null;
                if (node && events.context) {
                    scope.flow(events.context).write({node: node});
                }

                // jump to "object" node
                const edge = event.edges.length ? state.edges.get(event.edges[0]) : null;
                if (edge && events.jump) {
                    scope.flow(events.jump).write({edge: edge});
                }

                // Highlight traceback on click
                if (isTouchDevice) {
                    //traceBack(event);
                }
            }
        }, threshold);
    });

    if (isTouchDevice) {

        // Highlight traceback on hover
        //network.on('hoverNode', params => traceBack(params.node));

        // un-traceback on un-hover
        //network.on('blurNode', resetTrace);
    }

    // emit "expand/collapse" on hold
    network.on('hold', event => {
        state.eventTime = new Date();
        const node = event.nodes.length ? state.nodes.get(event.nodes[0]) : null;

        if (!node || !node.open) {
            return;
        }

        scope.flow(events.hold).write({node: node});
    });

    // emit "open" event on double click/tap
    network.on('doubleClick', event => {
        state.eventTime = new Date();
        const node = event.nodes.length ? state.nodes.get(event.nodes[0]) : null;

        if (!node || !node.open) {
            return;
        }

        scope.flow(typeof node.open === "string" ? node.open : events.open).write({node: node});
    });
};

exports.expandCollapse = (scope, state, args, data, next) => {

    let node_id = data.node ? (data.node.id || data.node) : null;
    if (!node_id) {
        return next(new Error('Flow-visualizer.expandCollapse: No node provided.'));
    }

    let node = state.nodes.get(node_id);

    if (!node || !node.expand) {
        return next(new Error('Flow-visualizer.expandCollapse: No node provided.'));
    }

    switch (node.state) {
        case state.config.events.expand:
            node.state = state.config.events.collapse;
            break;
        case 'loading':
            return;
        default:
            node.state = state.config.events.expand;
    }

    // update position before updating the graph
    if (node.id) {
        let pos = state.network.getPositions(node.id)[node.id];
        node.x = pos.x;
        node.y = pos.y;
    }

    state.nodes.update(node);
    scope.flow(node.state).write({node: node});

    next(null, data);
};

exports.focus = function (scope, state, args, data, next) {

    let node_id = data.focusTo || (data.node ? (data.node.id || data.node) : null);
    if (!node_id) {
        return next(new Error('Flow-visualizer.focus: No node provided.'));
    }

    // look in the data object for a custom scale value
    if (data.scale) {
        args.scale = data.scale;
    }

    state.network.focus(node_id, args);
    state.network.setSelection({ nodes: [node_id] }, { unselectAll: true });

    next(null, data);
};

exports.changeFocusZoom = function (scope, state, args, data, next) {

    // get current scale
    var scale = state.network.getScale();

    // a node must be selected
    let selectedNodes = state.network.getSelectedNodes();
    let node = (selectedNodes && selectedNodes.length) ? selectedNodes[0] : null;

    if (!node || !args.zoom) {
        return next(null, data);
    }

    if (args.zoom === 'in') {
        scale -= 0.20;
    } else if (args.zoom === 'out') {
        scale += 0.20;
    }

    scope.flow(events.zoomFocused).write({
        node: node,
        scale: scale
    });

    next(null, data);
};
