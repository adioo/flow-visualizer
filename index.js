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
        color: '#2E382E'
    });

    if (!(this.view = document.querySelector(args.view))) {
        return ready(new Error('Flow-visualizer: DOM target not found.'));
    }

    this.network = new vis.Network(this.view, {
        nodes: this.nodes,
        edges: this.edges
    }, args.vis);

    interaction(this, args.interaction);

    ready();
};

// TODO move this method to a graph utility module
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

    const index = this.index;
    const addNode = (node, target) => {
        if (index[node.id]) {
            ++index[node.id];
            return;
        }
        index[node.id] = 1;
        target.push(node);
    };

    triples.forEach(triple => {
        //var subpage = subpages[i];
        //var subpageID = getNeutralId(subpage);
        //if (!getEdgeConnecting(page, subpageID)) {
        //if (nodes.getIds().indexOf(subpageID) == -1) {
        //var nodeSpawn = getSpawnPosition(page);
        //x: nodeSpawn[0]
        //y: nodeSpawn[1]
        switch (triple[1]) {
            case 'http://schema.jillix.net/vocab/event':

                addNode({
                    id: triple[2],
                    label: triple[2],
                    level: 3,
                    color: '#FAA613',
                    type: 'event'
                }, data.nodes); 

                data.edges.push({
                    from: triple[0],
                    to: triple[2]
                });

                break;
            case 'http://schema.jillix.net/vocab/module':

                addNode({
                    id: triple[0],
                    label: triple[0],
                    level:2,
                    color: '#688E26',
                    type: 'inst'
                }, data.nodes); 

                addNode({
                    id: triple[2],
                    label: triple[2],
                    level:1,
                    shape: 'circle',
                    color: '#F43207',
                    type: 'module'
                }, data.nodes);

                data.edges.push({
                    from: triple[2],
                    to: triple[0]
                });

                addNode({
                    id: 'p_service' + triple[2],
                    from: 'p_service',
                    to: triple[2]
                }, data.edges);

                break;
            default:
                addNode({
                    id: triple[0],
                    label: triple[2],
                    level: 2,
                    type: 'inst',
                    color: '#688E26'
                }, data.nodes);
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
