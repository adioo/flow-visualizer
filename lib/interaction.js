'use strict'

const isTouchDevice = 'd' in document.documentElement;

module.exports = (scope, state, options) => {

    const network = state.network;
    const threshold = 200;
    state.eventTime = 0;

    // Click > Expand/Collaps sub tree
    network.on('click', event => {
        let t = new Date();
        setTimeout(() => {
            if (t - state.eventTime > threshold) {

                // TODO context menu
                const node = event.nodes.length ? state.nodes.get(event.nodes[0]) : null;
                const edge = event.edges.length ? state.edges.get(event.edges[0]) : null;
                if (node) {
                    console.log('Node "' + node.id + '" clicked!');
                }

                // jump to "object" node
                if (edge && state.event_if.jump) {
                    scope.flow(state.event_if.jump).write({edge: edge});
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

        if (!node || !node.edit) {
            return;
        }

        expandCollapse(scope, state, event);
    });

    // emit "edit" event on double click/tap
    network.on('doubleClick', event => {
        state.eventTime = new Date();
        const node = event.nodes.length ? state.nodes.get(event.nodes[0]) : null;

        if (!node || !node.edit) {
            return;
        }

        scope.flow(state.event_if.edit).write({node: node});
    }); 
};

function expandCollapse (scope, state, event) {

    const node = event.nodes.length ? state.nodes.get(event.nodes[0]) : null;

    if (!node || !node.expand) {
        return;
    }

    switch (node.state) {
        case state.event_if.expand:
            node.state = state.event_if.collapse;
            break;
        case 'loading':
            return;
        default:
            node.state = state.event_if.expand;
    }

    // update position before updating the graph
    if (node.id) {
        let pos = state.network.getPositions(node.id)[node.id];
        node.x = pos.x;
        node.y = pos.y;
    }

    state.nodes.update(node);

    scope.flow(node.state).write({node: node});
}
