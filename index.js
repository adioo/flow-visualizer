"use strict"

const Events = require("events");
const Parser = require("./lib/Parser");
const Interaction = require("./lib/Interaction");
const Manipulation = require("./lib/Manipulation");
const Visualization = require("./lib/visulaization");

function verifyConfig (config) {

    // create visjs only config object
    state.config = {};
    state.visConfig = {
        nodes: {
            shape: "dot",
            scaling: { min: 20,max: 30,
                label: { min: 14, max: 30, drawThreshold: 9, maxVisible: 20 }
            },
            font: {size: 14, face: "Helvetica Neue, Helvetica, Arial"}
        },
        interaction: {
            hover: true,
            hoverConnectedEdges: false,
            selectConnectedEdges: true
        }
    };

    Object.keys(args).forEach((key) => {
        switch (key) {
            case "events":
            case "parse":
            case "view":
            case "buttons":
            case "colors":
                state.config[key] = args[key];
                return;
            case "nodes":
            case "edges":
                state.visConfig[key] = {};
                state.config[key] = {};
                Object.keys(args[key]).forEach((subKey) => {
                    switch (subKey) {
                        case "events":
                        case "types":
                        case "expand":
                        case "open":
                            state.config[key][subKey] = args[key][subKey];
                            return;
                    }
                    state.visConfig[key][subKey] = args[key][subKey];
                });
                return;
        }

        state.visConfig[key] = args[key];
    });
    return
}

module.exports = (config) => {

    const VIS = new Events();
    const interaction = Interaction(VIS, config);
    const manipulation = Manipulation(VIS, config);
    const parser = Parser(VIS, config);

    // parse RDF strea-m
    VIS.parse: () => {},

    // interaction
    VIS.zoom: () => {},
    VIS.focus: () => {},
    VIS.select: () => {},

    // manipulation
    VIS.add: () => {},
    VIS.remove: () => {},
    VIS.reset: () => {}

    return Object.freeze(VIS);
};
