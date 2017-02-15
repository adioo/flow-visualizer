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

module.exports = (config) => {
    let VIS = new Events();

    // parse the config
    let options = buildOptions(config);

    // init all modules
    let visualization = new Visualization({
        view: options.config.view,
        vis: options.vis
    });
    let parser = new Parser({
        config: options.config
    });
    let navigation = new Navigation();
    let interaction = new Interaction();
    let manipulation = new Manipulation();

    // parse rdf data
    VIS.parse = parser.parse;

    return Object.freeze(VIS);
};
