"use strict"

const Button = require('./Button');

// the function, that must be exported
exports.toggle = (state, node) => {

    if (!node || !state.types[node.type]) {
        return;
    }

    // hide context menu
    if (
        (!state.types[node.type].actions || !state.types[node.type].actions.length) ||
        (state.contextMenu && node.id === state.contextMenu.id)
    ) {
        state.contextMenu = undefined;

    // show context menu
    } else {
        state.contextMenu = node;
    }
};

/* TODO context menu needs refactoring */
// Render context menus
exports.init = (scope, state) => {

    let canvas = state.network.canvas.frame.canvas;

    // draw buttons
    state.network.on('afterDrawing', (ctx) => {

        if (!state.contextMenu || !state.types[state.contextMenu.type]) {
            return;
        }

        // get node
        const node = state.contextMenu;
        const nodeId = node.id;

        // compute the button positions
        let boundingBox = state.network.getBoundingBox([nodeId]);
        if (!boundingBox) {
            return;
        }
        let menuY = boundingBox.bottom + 10;
        let menuX = state.network.getPositions([nodeId])[nodeId].x;
        let buttonsWidth = 0;

        // create the necessary buttons and place them
        if (!node.buttons) {

            let buttons = [];
            let actions = state.types[node.type].actions;
            actions.forEach(action => {
                let button = new Button(ctx, action.label, {
                    color: action.color,
                    fontColor: action.fontColor,
                    hoverColor: action.hoverColor
                });

                // append graph info to the button
                button.node = node;
                button.emit = action.emit;
                button.type = action.type || node.type;

                buttonsWidth += buttonsWidth === 0 ? button.width : button.width + 10;
                buttons.push(button);
            });

            state.contextMenu.buttons = buttons;
        } else {
            node.buttons.forEach(button => {
                buttonsWidth += buttonsWidth === 0 ? button.width : button.width + 10;
            });
        }

        // start placing the buttons
        let currentX = menuX - buttonsWidth / 2;
        node.buttons.forEach(button => {
            button.draw(currentX, menuY);
            currentX += button.width + 10;
        });

        ctx.save();
    });

    // button mouseover and mouseaway states
    let canvasOffset = canvas.getBoundingClientRect();
    canvas.addEventListener('mousemove', event => {

        if (!state.contextMenu || !state.contextMenu.buttons) {
            return;
        }

        let mouse = state.network.DOMtoCanvas({
            x: event.clientX - canvasOffset.left,
            y: event.clientY - canvasOffset.top
        });

        state.contextMenu.buttons.forEach(button => {
            if (mouse.x >= button.x && mouse.x <= button.x + button.width && mouse.y >= button.y && mouse.y <= button.y + button.height) {
                button.mouseOver();
            } else {
                button.mouseAway();
            }
        });
    }, false);

    // listen for click events on the buttons
    state.network.on('click', event => {

        if (!state.contextMenu || !state.contextMenu.buttons) {
            return;
        }

        let mouse = {
            x: event.pointer.canvas.x,
            y: event.pointer.canvas.y
        }

        state.contextMenu.buttons.forEach(button => {
            if (mouse.x >= button.x && mouse.x <= button.x + button.width && mouse.y >= button.y && mouse.y <= button.y + button.height) {
                button.mouseDown();
                scope.flow(button.emit).write({node: button.node, type: button.type});
            }
        });
    });
};
