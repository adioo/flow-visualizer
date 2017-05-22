'use strict'

// Dependencies
const Vis = require('vis');
const Events = require('events');
const Parser = require('./lib/Parser');
const Manipulation = require('./lib/Manipulation');

// const values
const CONFIG_DEFAULTS = {
    container: '.graph',
    vis: {},
    colors: {},
    buttons: {}
};

module.exports = (config) => {
    let self = new Events();

    // check config integrity
    checkConfig(config);
    self.config = config;

    // initialize graph
    self.nodes = new Vis.DataSet([]);
    self.edges = new Vis.DataSet([]);

    self.index = {
        nodes: {},
        edges: {}
    };

    self.container = document.querySelector(self.config.container);
    if (!self.container) {
        throw new Error('Flow-visualizer: DOM graph ref not found.');
    }

    self.network = new Vis.Network(self.container, {
        nodes: self.nodes,
        edges: self.edges
    }, self.config.vis);


    // export visualization methods
    self.add = Manipulation.add;
    self.remove = Manipulation.remove;
    self.reset = Manipulation.reset;
    self.parse = Parser.parse.bind(self);
    self.getSelectedNode = () => {
        let selectedNodes = self.network.getSelectedNodes();
        let node = (selectedNodes && selectedNodes.length) ? selectedNodes[0] : null;

        return node;
    };

    return self;
};

/* Private functions */

/* checkConfig
 *
 * Check config object integrity and add defaults
 *
 */
function checkConfig (config) {
    config = config || {};

    Object.keys(CONFIG_DEFAULTS).forEach(key => {
        config[key] = config[key] || CONFIG_DEFAULTS[key];
    });

    if (!config.parse) {
        throw new Error('Flow-visualizer: Parse config is missing.');
    }

    if (!config.parse.nodes) {
        throw new Error('Flow-visualizer: Parse nodes config is missing.');
    }

    if (!config.parse.edges) {
        throw new Error('Flow-visualizer: Parse edges config is missing.');
    }

    if (!config.parse.triples) {
        throw new Error('Flow-visualizer: Parse triples config is missing.');
    }
}
