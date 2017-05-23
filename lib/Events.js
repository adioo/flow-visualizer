'use strict';

module.exports = function (listener) {
    // values used by the click handlers
    const threshold = 200;
    let eventTime = 0;

    // a collection for handlers for various events
    let handlers = {
        'click': (type, config) => {
            return event => {
                let t = new Date();
                setTimeout(() => {
                    if (t - eventTime > threshold) {

                        switch (type) {
                            case 'nodes':
                                let node = event.nodes.length ? this.nodes.get(event.nodes[0]) : null;

                                if (node) {
                                    listener({
                                        eventName: config,
                                        eventObj: event,
                                        data: {
                                            node: node
                                        }
                                    });
                                }
                                break;
                            case 'edges':
                                let edge = event.edges.length ? this.edges.get(event.edges[0]) : null;

                                if (edge) {
                                    listener({
                                        eventName: config,
                                        eventObj: event,
                                        data: {
                                            edge: edge
                                        }
                                    });
                                }
                                break;
                        };
                    }
                }, threshold);
            }
        },
        'doubleClick': (type, config) => {
            return event => {
                eventTime = new Date();

                if (type !== 'nodes') {
                    return;
                }

                const node = event.nodes.length ? this.nodes.get(event.nodes[0]) : null;

                if (!node) {
                    return;
                }

                listener({
                    eventName: config,
                    eventObj: event,
                    data: {
                        node: node
                    }
                });
            }
        },
        'hold': (type, config) => {
            return event => {
                eventTime = new Date();

                if (type !== 'nodes') {
                    return;
                }

                const node = event.nodes.length ? this.nodes.get(event.nodes[0]) : null;

                if (!node) {
                    return;
                }

                listener({
                    eventName: config,
                    eventObj: event,
                    data: {
                        node: node
                    }
                });
            }
        }
    };

    // setup handlers for all types
    ['nodes', 'edges'].forEach(type => {
        let events = this.config.parse[type].events || {};

        Object.keys(events).forEach(eventName => {
            // check if such a handler exists
            if (!handlers[eventName]) {
                console.error('No handler implemented for event "' + eventName + '"');
            }

            this.network.on(eventName, handlers[eventName](type, events[eventName]));
        });
    });
};