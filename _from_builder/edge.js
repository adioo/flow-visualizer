'use strict';

class Edge {
    constructor(from, to, options) {

        // add core options
        this.to = to;
        this.from = from;

        // add custom options
        if (typeof options === 'object') {
            Object.keys(options).forEach((option) => {
                this[option] = options[option];
            });
        }

    }
}

module.exports = Edge;