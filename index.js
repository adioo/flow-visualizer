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

    this.first = true;
    this.nodes = new vis.DataSet();
    this.edges = new vis.DataSet();

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

    const temp_index = {};
    const addNode = (node, target) => {
        if (temp_index[node.id]) {
            ++temp_index[node.id];
            return;
        }
        temp_index[node.id] = 1;
        target.push(node);
    };

    triples.forEach(triple => {

        //var subpage = subpages[i];
        //var subpageID = getNeutralId(subpage);
        //if (nodes.getIds().indexOf(subpageID) == -1) {
        //value: 1,
        //level: level,
        //color: getColor(level),
        //parent: page,
        //x: nodeSpawn[0],
        //y: nodeSpawn[1]
        
        if (
            triple[1] === 'http://schema.jillix.net/vocab/module' ||
            triple[1] === 'http://schema.jillix.net/vocab/event'
        ) {
            addNode({id: triple[0], label: triple[0]}, data.nodes); 
            addNode({id: triple[2], label: triple[2], shape: 'circle'}, data.nodes); 
            data.edges.push({from: triple[0], to: triple[2]});
        } else {
            addNode({
                id: triple[0],
                label: triple[2]
            }, data.nodes);
        }

        //}

        //if (!getEdgeConnecting(page, subpageID)) {
        //color: getEdgeColor(level),
        //level: level,
        //selectionWidth:2,
        //hoverWidth:0
        //}
    });
 
    next(null, data);

    /*const node;
    if (data.expand) {
        node = this.nodes.get(data.expand);
    }

    const level = node ? node.level + 1 : 0;

    // Where new nodes should be spawned
    var nodeSpawn = getSpawnPosition(page);*/
};

exports.add = function (args, data, next) {

    if (!data.nodes && !data.edges) {
        return next(new Error('Flow-visualizer.add: No nodes or edges found.'));
    }

    data.nodes && this.nodes.add(data.nodes);
    data.edges && this.edges.add(data.edges);

    next(null, data);
};
