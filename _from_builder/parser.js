'use strict';

// Dependencies
const Node = require('./node');
const Edge = require('./edge');

// constants
const SCHEMA = 'http://schema.org/';
const FLOW = 'http://schema.jillix.net/vocab/';
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

exports.parse = (triples, type) => {

    if (!triples || !triples.length) {
        return {
            nodes: [],
            edges: []
        }
    }

    // parse the triples based on the resource type
    let result;
    switch (type) {
        case 'entrypoints':
            result = parseEntrypoints(triples);
            break;
        case 'modules':
            result = parseModules(triples);
            break;
        case 'instances':
            result = parseInstances(triples);
            break;
        case 'instance':
            result = parseInstance(triples);
            break;
        case 'event':
            result = parseEvent(triples);
            break;
        default:
            return new Error('Builder.Parser: Invalid resource type.');     
    }

    return result;
};

let parseEntrypoints = (triples) => {

    let entrypoints = {};
    triples.forEach((triple) => {
        entrypoints[triple[0]] = {
            label: triple[2]
        }
    });

    // build nodes
    let result = {
        nodes: [],
        edges: []
    };
    Object.keys(entrypoints).forEach((entrypointIRI) => {

        let entrypoint = entrypoints[entrypointIRI];
        console.log(entrypointIRI);
        let node = new Node(entrypointIRI, 'entrypoint', entrypoint.label);
        result.nodes.push(node);
    });

    return result;
};

let parseModules = (triples) => {

    let project = triples[0][0];
    let modules = {};
    triples.forEach((triple) => {
        let module = fromIRI(triple[2]);
        let splits = module.split('/').filter(Boolean);
        modules[module] = {
            name: splits[3],
            owner: splits[2]
        };
    });

    let result = {
        nodes: [],
        edges: []
    };

    Object.keys(modules).forEach((moduleIRI) => {
        let module = modules[moduleIRI];

        let node = new Node(moduleIRI, 'module', module.owner + '/' + module.name, {
            name: module.name,
            owner: module.owner
        });
        let edge = new Edge(project, moduleIRI);

        result.nodes.push(node);
        result.edges.push(edge);
    });

    return result;
};

let parseInstances = (triples) => {

    // get all instance ids and their names
    let instances = {};
    triples.forEach((triple) => {

        // add instance name to be used as label
        if (fromIRI(triple[1]) === SCHEMA + 'name') {
            instances[fromIRI(triple[0])] = instances[fromIRI(triple[0])] || {};
            instances[fromIRI(triple[0])].name = triple[2];
        }

        // add module dependency
        if (fromIRI(triple[1]) === FLOW + 'module') {
            instances[fromIRI(triple[0])] = instances[fromIRI(triple[0])] || {};
            instances[fromIRI(triple[0])].module = fromIRI(triple[2]);
        }
    });

    // build the nodes
    let result = {
        nodes: [],
        edges: []
    };
    Object.keys(instances).forEach((instanceIRI) => {
        let instance = instances[instanceIRI];

        // add node
        let node = new Node(instanceIRI, 'instance', instance.name);
        result.nodes.push(node);

        // add module dependency
        let edge = new Edge(instance.module, instanceIRI, {
            label: 'instance'
        });
        result.edges.push(edge);
    });

    return result;
};

let parseInstance = (triples) => {

    let instanceIRI = fromIRI(triples[0][0]);
    let events = [];
    triples.forEach((triple) => {

        // if predicate is an event then the subject is an instance
        if (fromIRI(triple[1]) === FLOW + 'event') {
            events.push(fromIRI(triple[2]));
        }
    });

    // add edges and event nodes
    let result = {
        nodes: [],
        edges: []
    };
    events.forEach((eventIRI) => {

        // build node
        let splits = eventIRI.split('/').filter(Boolean);
        let label = splits[splits.length - 1];
        let node = new Node(eventIRI, 'event', label, {
            instance: instanceIRI
        });

        // build edege
        let edge = new Edge(instanceIRI, eventIRI, {
            label: 'event'
        });

        result.nodes.push(node);
        result.edges.push(edge);
    });

    return result;
};

let parseEvent = (triples) => {

    let result = {
        nodes: [],
        edges: []
    };

    // get the event
    let event = fromIRI(triples[0][0]);
    let sequences = [];

    // find the sequence, onError and on Load of the event
    let sequenceNode = null;
    triples.forEach((triple) => {

        if (fromIRI(triple[0]) === event && fromIRI(triple[1]) === FLOW + 'sequence') {
            sequenceNode = triple[2];

        // add the nodes and edges for the onError event
        } else if (fromIRI(triple[0]) === event && fromIRI(triple[1]) === FLOW + 'onError') {

            let splits = fromIRI(triple[2]).split('/').filter(Boolean);
            let label = splits[splits.length - 1];
            let node = new Node(fromIRI(triple[2]), 'errorHandler', label);
            let edge = new Edge(event, fromIRI(triple[2]), {
                label: 'onError'
            });
            result.nodes.push(node);
            result.edges.push(edge);

        // add the nodes and edges for the onEnd event
        } else if (fromIRI(triple[0]) === event && fromIRI(triple[1]) === FLOW + 'onEnd') {

            let splits = fromIRI(triple[2]).split('/').filter(Boolean);
            let label = splits[splits.length - 1];
            let node = new Node(fromIRI(triple[2]), 'endHandler', label);
            let edge = new Edge(event, fromIRI(triple[2]), {
                label: 'onEnd'
            });
            result.nodes.push(node);
            result.edges.push(edge);
        }
    });

    // return the current result if no sequences
    if (!sequenceNode) {
        return result;
    }

    // go to the end of the sequence
    let sequenceEnd = false;
    while (!sequenceEnd) {
        let nextSequence = null;

        // curent sequence
        let sequence = {
            id: sequenceNode
        };

        triples.forEach((triple) => {

            // select the sequence related triples
            if (triple[0] === sequenceNode) {

                switch (fromIRI(triple[1])) {
                    case FLOW + 'dataHandler':
                        sequence.type = 'dataHandler';
                        sequence.value = fromIRI(triple[2]);
                        break
                    case FLOW + 'streamHandler':
                        sequence.type = 'streamHandler';
                        sequence.value = fromIRI(triple[2]);
                        break;
                    case FLOW + 'onceHandler':
                        sequence.type = 'onceHandler';
                        sequence.value = fromIRI(triple[2]);
                        break;
                    case FLOW + 'emit':
                        sequence.type = 'emit';
                        sequence.value = fromIRI(triple[2]);
                        break;
                    case FLOW + 'sequence':
                        sequence.next = true;
                        nextSequence = triple[2];
                        break;
                    default:
                        return;
                }
            }
        });

        if (!nextSequence) {
            sequenceEnd = true;
        } else {
            sequenceNode = nextSequence;
        }
        sequences.push(sequence);
    }

    // build the nodes and edges
    let firstEdge = new Edge(event, sequences[0].id, {
        label: sequences[0].type,
        hoverWidth: 0
    });
    result.edges.push(firstEdge);
    for (let i = 0 ; i < sequences.length; ++ i) {
        let sequence = sequences[i];

        // add the sequence node
        let nodeLabel = (sequence.type === 'emit') ? sequence.value.substring(sequence.value.lastIndexOf('/')) : sequence.value.substring(sequence.value.lastIndexOf('#'));
        let node = new Node(sequence.id, sequence.type, nodeLabel, {
            event: event
        });
        result.nodes.push(node);


        // add the sequence edge
        if (sequence.next) {
            let edge = new Edge(sequence.id, sequences[i + 1].id, {
                label: sequences[i + 1].type,
                hoverWidth: 0
            });
            result.edges.push(edge);
        }
    }

    return result;
};

/* Util functions */
let fromIRI = (str) => {
    return str.substring(1, str.length - 1);
}