'use strict';

// Dependencies
const Graph = require('./lib/graph');
const Api = require('./lib/api');

/* public function */

/*
 *
 * initilizes the builder module
 * @name init
 *
 */
exports.init = function (config, ready) {
    this._config = config;

    // initilize api
    let flowApi = new Api(config.api);

    // initilize graph
    let graph = new Graph(flowApi, this._config.selector, this._config.vis);
    this._graph = graph;

    // setup events
    if (this._config.events) {
        let self = this;
        this._config.events.forEach((eventName) => {
            self._graph.on(eventName, (eventData) => {

                self.flow(eventName).write(eventData);
            });
        });
    }

    ready();
};

/*
 *
 * builds the initial state of the graph
 * @name buildGraph
 *
 */
exports.buildGraph = function (options, data, next) {
    this._graph.render('entrypoints', function (err) {
        next(err, data);
    });
};

exports.search = function (options, data, next) {
    this._graph.search(data);
    next(null, data);
};

/*
 *
 * shows or hides a node and their subgraphs
 * @name toggleVisibility
 *
 */
exports.toggleVisibility = function(options, data, next) {
    this._graph.toggleVisibility(data.nodeId, (err) => {
        next(err, data);
    });
}