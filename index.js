'use strict'

//const vis = require('vis');
const interaction = require('./lib/interaction');

exports.init = function (args, ready) {

    args.vis = Object.assign({
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
        selectConnectedEdges: true,
      },
    }, args.vis || {});

    this.index = {};
    this.nodes = new vis.DataSet();
    this.edges = new vis.DataSet();
    this.nodes.add({
        id: 'p_service',
        label: 'Service',
        level: 0,
        shape: 'circle',
        color: '#4E96BA'
    });

    if (!(this.view = document.querySelector(args.view))) {
        return ready(new Error('Flow-visualizer: DOM target not found.'));
    }

    this.network = new vis.Network(this.view, {
        nodes: this.nodes,
        edges: this.edges
    }, args.vis);

// TEMP DEV GLOBAL
window.NODE_INDEX = this.index;

    interaction(this, args.interaction);

    ready();
};

exports.parse = function (args, data, next) {

    let triples;
    if (!(data instanceof Array) && args.key && data[args.key]) {
        triples = data[args.key];
        data.nodes = [];
        data.edges = [];
    } else {
        triples = data;
        data = {
            nodes: [],
            edges: []
        };
    }

    const pos = data.id ? this.network.getPositions(data.id)[data.id] : {x: 0, y: 0};
    const index = this.index;
    const addNode = (node, target) => {
        if (index[node.id]) {
            ++index[node.id];
            return;
        }
        index[node.id] = 1;
        node.x = pos.x;
        node.y = pos.y;
        target.push(node);
    };

    triples.forEach(triple => {
        //var nodeSpawn = getSpawnPosition(page);
        //x: nodeSpawn[0]
        //y: nodeSpawn[1]
        switch (triple[1]) {
            case 'http://schema.jillix.net/vocab/dataHandler':
            case 'http://schema.jillix.net/vocab/onceHandler':
            case 'http://schema.jillix.net/vocab/streamHandler':
            case 'http://schema.jillix.net/vocab/emit':
                let type = triple[1].split('/').pop();
                let label = type === 'emit' ? triple[2].split('/').pop() : triple[2].split('#').pop();

                let color;
                switch (type) {
                    case 'dataHandler':
                        color = '#74A4BC';
                        break;
                    case 'onceHandler':
                        color = '#006E90';
                        break;
                    case 'streamHandler':
                        color = '#AFD2E9';
                        break;
                    case 'emit':
                        color = '#FAA613';
                        break;
                }

                addNode({
                    id: triple[0],
                    label: label,
                    level: 4,
                    color: color,
                    type: 'handler'
                }, data.nodes);
                break;

            case 'http://schema.jillix.net/vocab/sequence':
                addNode({
                    id: triple[0] + triple[2],
                    from: triple[0],
                    to: triple[2]
                }, data.edges);
                break;

            case 'http://schema.jillix.net/vocab/event':
                addNode({
                    id: triple[2],
                    label: triple[2].split('/').pop(),
                    level: 3,
                    color: '#FAA613',
                    type: 'event'
                }, data.nodes); 

                data.edges.push({
                    from: triple[0],
                    to: triple[2]
                });

                break;
            case 'http://schema.jillix.net/vocab/ModuleInstanceConfig':

                addNode({
                    id: triple[2],
                    label: triple[2],
                    level:2,
                    color: '#688E26',
                    type: 'inst'
                }, data.nodes);

                addNode({
                    id: triple[0] + triple[2],
                    from: triple[0],
                    to: triple[2]
                }, data.edges);

                break;
            case 'http://schema.jillix.net/vocab/Module':

                addNode({
                    id: triple[2],
                    label: triple[0].slice(1, -1),
                    level:1,
                    shape: 'circle',
                    color: '#F46A4B',
                    type: 'module'
                }, data.nodes);

                addNode({
                    id: 'p_service' + triple[2],
                    from: 'p_service',
                    to: triple[2]
                }, data.edges);

                break;
            default:
                console.error('Flow-visualizer.parse: Invalid triple "' + triple + '".');
        }
    });
 
    next(null, data);
};

exports.add = function (args, data, next) {

    if (!data.nodes && !data.edges) {
        return next(new Error('Flow-visualizer.add: No nodes or edges found.'));
    }

    data.nodes && this.nodes.add(data.nodes);
    data.edges && this.edges.add(data.edges);

    next(null, data);
};
