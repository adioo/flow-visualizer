"use strict"

const Button = require('./Button');

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

/* TODO context menu needs refactoring */
    // Render context menus

    // Click & Hold > show context menu
    network.on('hold', event => {
        state.eventTime = new Date();
        contextMenu(scope, state, event);
    });

    state.contextMenus = {};
    let canvas = network.canvas.frame.canvas;

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
