'use strict'

// Dependencies
const Events = require('events');
const Parser = require('./lib/Parser');
const Interaction = require('./lib/Interaction');
const Manipulation = require('./lib/Manipulation');
const Visualization = require('./lib/Visualization');
const Navigation = require('./lib/Navigation');

function buildOptions (config) {

    // create visjs only config object
    let options = {
        vis: {
            nodes: {
                shape: 'dot',
                scaling: { min: 20,max: 30,
                    label: { min: 14, max: 30, drawThreshold: 9, maxVisible: 20 }
                },
                font: {size: 14, face: 'Helvetica Neue, Helvetica, Arial'}
            },
            interaction: {
                hover: true,
                hoverConnectedEdges: false,
                selectConnectedEdges: true
            }
        },
        config: {}
    };

    Object.keys(config).forEach((key) => {
        switch (key) {
            case 'events':
            case 'parse':
            case 'view':
            case 'buttons':
            case 'colors':
                options.config[key] = config[key];
                return;
            case 'nodes':
            case 'edges':
                options.vis[key] = {};
                options.config[key] = {};
                Object.keys(config[key]).forEach((subKey) => {
                    switch (subKey) {
                        case 'events':
                        case 'types':
                        case 'expand':
                        case 'open':
                            options.config[key][subKey] = config[key][subKey];
                            return;
                    }
                    options.vis[key][subKey] = config[key][subKey];
                });
                return;
        }

        options.vis[key] = config[key];
    });

    return options;
}

function VIS (config) {
    // parse the config
    let options = buildOptions(config);
    this.options = options;

    // init all modules
    this.visualization = new Visualization({
        view: options.config.view,
        vis: options.vis
    });
    this.parser = new Parser({
        config: options.config
    });
    this.navigation = new Navigation(this.visualization);
    this.interaction = new Interaction(this.visualization, options.config);
    this.manipulation = new Manipulation(this.visualization);

    // parse rdf data
    this.parse = (triples, startNode, onlyParse) => {

        if (!startNode) {
            startNode = { id: '' };
        }

        let pos = {};
        pos.x = startNode.x || 0;
        pos.y = startNode.y || 0;
        pos.l = this.visualization.network.getBoundingBox(startNode.id) || {top: 0, left: 0, bottom: 0, right: 0};
        pos.l = Math.sqrt(Math.pow(pos.l.top - pos.l.bottom, 2) + Math.pow(pos.l.right - pos.l.left, 2));
        pos.parent = startNode.parent ? this.visualization.network.getPositions(startNode.parent)[startNode.parent] : {x: 0, y: 0};

        return this.parser.parse(triples, startNode, pos, onlyParse ? null : this.visualization.index);
    };
}

module.exports = VIS;