'use strict'

const Button = require('./Button');
const isTouchDevice = 'd' in document.documentElement;

module.exports = (scope, state, options) => {

    const network = state.network;

    if (isTouchDevice) {
        // Highlight traceback on click
        network.on('click', traceBack);
    } else {
        // Highlight traceback on hover
        network.on('hoverNode', function(params) {
            traceBack(params.node);
        });
        // un-traceback on un-hover
        network.on('blurNode', resetTrace);
    }

    let threshold = 200;
    let eventTime = 0;

    // Click > Expand/Collaps sub tree
    network.on('click', event => {
        let t = new Date();
        setTimeout(() => {
            if (t - eventTime > threshold) {
                expandCollapse(scope, state, event);
            }
        }, threshold);
    });

    // Click & Hold > show context menu
    network.on('hold', event => {
        eventTime = new Date();
        contextMenu(scope, state, event);
    });

    // 2x Click > show detail form
    network.on('doubleClick', event => {
        eventTime = new Date();
        const node = event.nodes.length ? state.nodes.get(event.nodes[0]) : null;

        if (!node) {
            return;
        }

        scope.flow(state.event_if.detailView).write({node: node});
    });

    // Render context menus
    state.contextMenus = {};
    let canvas = network.canvas.frame.canvas;

    /* TODO context menu needs refactoring */

    // draw buttons
    network.on('afterDrawing', (ctx) => {

        let nodeIds = Object.keys(state.contextMenus);

        nodeIds.forEach(nodeId => {
            let node = state.nodes.get(nodeId);
            if (!node || !state.types[node.type]) {
                return;
            }

            let actions = state.types[node.type].actions;

            if (!actions || !Object.keys(actions).length) {
                return;
            }

            // compute the button positions
            let menuY = network.getBoundingBox([nodeId]).bottom + 10;
            let menuX = state.network.getPositions([nodeId])[nodeId].x;

            // create the necessary buttons and place them
            let buttonsWidth = 0;
            let buttons = [];
            Object.keys(actions).forEach(actionName => {
                let action = actions[actionName];
                let button = new Button(ctx, action.label, {
                    color: action.color,
                    fontColor: action.fontColor,
                    hoverColor: action.hoverColor
                });

                // append graph info to the button
                button.node = nodeId;
                button.event = action.event;

                buttonsWidth += buttonsWidth === 0 ? button.width : button.width + 10;
                buttons.push(button);
            });

            // start placing the buttons
            let currentX = menuX - buttonsWidth / 2;
            buttons.forEach(button => {
                button.draw(currentX, menuY);
                currentX += button.width + 10;
            });

            state.contextMenus[nodeId] = buttons;
        });

        ctx.save();
    });

    // listen for events on context menus
    canvas.addEventListener('mousemove', event => {
        let mouse = network.DOMtoCanvas({x: event.clientX, y: event.clientY});

        Object.keys(state.contextMenus).forEach(nodeId => {
            let buttons = state.contextMenus[nodeId];
            buttons.forEach(button => {
                if (mouse.x >= button.x && mouse.x <= button.x + button.width && mouse.y >= button.y && mouse.y <= button.y + button.height) {
                    button.mouseOver();
                } else {
                    button.mouseAway();
                }
            });
        });
    }, false);

    // listen for click event on contex buttons
    canvas.addEventListener('mouseup', event => {
        let mouse = network.DOMtoCanvas({x: event.clientX, y: event.clientY});

        Object.keys(state.contextMenus).forEach(nodeId => {
            let buttons = state.contextMenus[nodeId];
            buttons.forEach(button => {
                if (mouse.x >= button.x && mouse.x <= button.x + button.width && mouse.y >= button.y && mouse.y <= button.y + button.height) {
                    button.mouseUp();
                }
            });
        });
    }, false);

    // listen for click event on contex buttons
    canvas.addEventListener('mousedown', event => {
        let mouse = network.DOMtoCanvas({x: event.clientX, y: event.clientY});

        Object.keys(state.contextMenus).forEach(nodeId => {
            let buttons = state.contextMenus[nodeId];
            buttons.forEach(button => {
                if (mouse.x >= button.x && mouse.x <= button.x + button.width && mouse.y >= button.y && mouse.y <= button.y + button.height) {
                    button.mouseDown();
                    scope.flow(button.event).write({node: button.node});
                }
            });
        });
    }, false);
};

function expandCollapse (scope, state, event) {

    const node = event.nodes.length ? state.nodes.get(event.nodes[0]) : null;

    if (!node) {
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

function contextMenu (scope, state, event) {

    const node = event.nodes.length ? state.nodes.get(event.nodes[0]) : null;

    if (!node || !state.types[node.type]) {
        return;
    }

    // do not add menu if no actions defined
    let actions = state.types[node.type].actions;
    if (!actions || !Object.keys(actions).length) {
        return;
    }

    if (!state.contextMenus[node.id]) {
        state.contextMenus[node.id] = {};
    } else {
        delete state.contextMenus[node.id];
    }
}

function traceBack () {

    //console.log('Trace back:', arguments);

    // TODO touch traceback
    /*if (params.nodes.length) { //Was the click on a node?
        //The node clicked
        var page = params.nodes[0];
        //Highlight in blue all nodes tracing back to central node
        traceBack(page);
    } else {
        resetProperties();
    }*/

    /*if (node != selectedNode) {
        selectedNode = node;
        resetProperties();
        tracenodes = getTraceBackNodes(node);
        traceedges = getTraceBackEdges(tracenodes);
        //Color nodes yellow
        var modnodes = tracenodes.map(function(i){return nodes.get(i);});
        colorNodes(modnodes, 1);
        //Widen edges
        var modedges = traceedges.map(function(i){
            var e=edges.get(i);
            e.color={inherit:"to"};
                return e;
        });
        edgesWidth(modedges, 5);
    }*/
}

function resetTrace () {

    //console.log('Reset trace:', arguments);

    /*if (!isReset) {
        selectedNode = null;
        //Reset node color
        var modnodes = tracenodes.map(function(i){return nodes.get(i);});
        colorNodes(modnodes, 0);
        //Reset edge width and color
        var modedges = traceedges.map(function(i){
            var e=edges.get(i);
            e.color=getEdgeColor(nodes.get(e.to).level);
            return e;
        });
        edgesWidth(modedges, 1);
        tracenodes = [];
        traceedges = [];
    }*/
}
