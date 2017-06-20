'use strict';

module.exports = function (listener) {
    // values used by the click handlers
    const threshold = 200;
    let eventTime = 0;

    // a collection for handlers for various events
    let handlers = {
        'click': (type, config, event) => {
            let t = new Date();
            setTimeout(() => {
                if (t - eventTime > threshold) {
                    eventTime = new Date();

                    listener({
                        eventName: config,
                        eventObj: event
                    });
                }
            }, threshold);
        },
        'doubleClick': (type, config, event) => {
            eventTime = new Date();

            listener({
                eventName: config,
                eventObj: event
            });
        },
        'hold': (type, config, event) => {
            eventTime = new Date();

            listener({
                eventName: config,
                eventObj: event
            });
        }
    };

    // listen for all implemented methods
    Object.keys(handlers).forEach(eventName => {

        // check if any of the available types use this event
        let types = {};
        ['nodes', 'edges', 'canvas'].forEach(type => {
            let events = this.config.events[type] || {};
            if (events[eventName]) {
                types[type] = events[eventName]
            }
        });
        if (!Object.keys(types).length) {
            return;
        }

        this.network.on(eventName, event => {
            if (types.nodes && event.nodes.length) {
                handlers[eventName]('node', types.nodes, event);
            } else if (types.edges && event.edges.length) {
                handlers[eventName]('edge', types.edges, event);
            } else if (types.canvas && !event.edges.length && !event.nodes.length) {
                handlers[eventName]('canvas', types.canvas, event);
            }
        });
    });
};