'use strict';

exports.focus = function (nodeId, args) {

    this.network.focus(nodeId, args);
    this.network.setSelection({ nodes: [nodeId] }, { unselectAll: true });
};

exports.zoom = function (args) {

    // get current scale
    var scale = this.network.getScale();

    // a node must be selected
    let selectedNodes = this.network.getSelectedNodes();
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

exports.expandCollapse = function (nodeId) {

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
        let pos = this.network.getPositions(node.id)[node.id];
        node.x = pos.x;
        node.y = pos.y;
    }

    this.nodes.update(node);
    this.emit(node.state, { node: node });
}