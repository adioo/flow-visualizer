'use strict';

// dependencies
const Events = require('events');

function Interaction (vis, config) {
    let self = new Events();

    self.vis = vis;
    self.events = config.events;

    // methods
    self.zoom = zoom;
    self.focus = focus;
    self.select = select;
    self.expandCollapse = expandCollapse;

    // events
    // TODO dynamic events
    self.threshold = 200;
    self.eventTime = 0;
    self.vis.network.on('click', event => {
        let t = new Date();
        setTimeout(() => {
            if (t - self.eventTime > self.threshold) {

                // show context menu on node
                const node = event.nodes.length ? self.vis.nodes.get(event.nodes[0]) : null;
                if (node && self.events.context) {
                    self.emit('context', { node: node });
                }

                // jump to "object" node
                const edge = event.edges.length ? self.vis.edges.get(event.edges[0]) : null;
                if (edge && self.events.jump) {
                    self.emit('jump', {edge: edge});
                }
            }
        }, self.threshold);
    });

    self.vis.network.on('hold', event => {
        self.eventTime = new Date();
        const node = event.nodes.length ? self.vis.nodes.get(event.nodes[0]) : null;

        if (!node) {
            return;
        }

        self.emit('hold', { node: node });
    });

    self.vis.network.on('doubleClick', event => {
        self.eventTime = new Date();
        const node = event.nodes.length ? self.vis.nodes.get(event.nodes[0]) : null;

        if (!node) {
            return;
        }

        self.emit(typeof node.edit === "string" ? node.edit : 'edit', { node: node });
    });

    return self;
}

function focus (nodeId, args) {

    // todo check args

    this.vis.network.focus(nodeId, args);
    this.vis.network.setSelection({ nodes: [nodeId] }, { unselectAll: true });
}

function zoom (args) {

    // get current scale
    var scale = this.vis.network.getScale();

    // a node must be selected
    let selectedNodes = this.vis.network.getSelectedNodes();
    let node = (selectedNodes && selectedNodes.length) ? selectedNodes[0] : null;

    if (!node || !args.zoom) {
        return;
    }

    if (args.zoom === 'in') {
        scale -= 0.20;
    } else if (args.zoom === 'out') {
        scale += 0.20;
    }

    this.focus(node, { scale: scale });
}

function select () {

}

function expandCollapse (nodeId) {

    let node = this.vis.nodes.get(nodeId);

    if (!node || !node.expand) {
        return;
    }

    switch (node.state) {
        case 'expand':
            node.state = 'collapse';
            break;
        case 'loading':
            return;
        default:
            node.state = 'expand';
    }

    // update position before updating the graph
    if (node.id) {
        let pos = this.vis.network.getPositions(node.id)[node.id];
        node.x = pos.x;
        node.y = pos.y;
    }

    this.vis.nodes.update(node);
    this.emit(node.state, { node: node });
}

module.exports = Interaction;