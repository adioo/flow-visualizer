'use strict';

/* add
 *
 * Add nodes or edges to the graph
 *
 * data = {
 *     nodes: {},
 *     edges: {}
 * }
 *
 */
exports.add = function (data, startNode) {
    return new Promise((resolve, reject) => {

        startNode = startNode || {};
        data.nodes = data.nodes || {};
        data.edges = data.edges || {};

        // init node positions
        let pos = {
            a: 360 / Object.keys(data.nodes).length,
            x: startNode.x || 0,
            y: startNode.y || 0,
            parent: {
                x: 0,
                y: 0
            }
        };
        pos.l = this.network.getBoundingBox(startNode.id) || {top: 0, left: 0, bottom: 0, right: 0};
        pos.l = Math.sqrt(Math.pow(pos.l.top - pos.l.bottom, 2) + Math.pow(pos.l.right - pos.l.left, 2));
        pos.c = (pos.l * 0.5) / Math.cos(pos.a * 0.5) + /*TODO: make spring constance configurable:*/95/**/ + pos.l;
        pos._ = 0;//Math.atan2(pos.y - pos.parent.y, pos.x - pos.parent.x) * (180 / Math.PI);

        // parse edges and add children an parents to nodes
        let edgesToAdd = [];
        Object.keys(data.edges).forEach(edgeId => {
            let exists = this.edges.get(edgeId);
            if (exists) {
                return;
            }

            let edge = data.edges[edgeId];

            // add outgoing and incoming edges to nodes
            let parent = this.index.nodes[edge.from] || data.nodes[edge.from];
            let child = this.index.nodes[edge.to] || data.nodes[edge.to];

            if (!child || parent) {
                return;
            }

            parent.o.push(edgeId);
            parent.children.push(child.id);
            child.i ++;
            child.parent = parent.id;

            this.index.edges[edgeId] = edge;
            edgesToAdd.push(edge);
        });

        const node_types = this.config.parse.nodes.types;
        let nodesToAdd = [];
        Object.keys(data.nodes).forEach(nodeId => {
            let exists = this.nodes.get(nodeId);
            if (exists) {
                return;
            }

            let node = data.nodes[nodeId];
            let type = node_types[node.type];

            // compute node position
            node.x = type.level < 4 ? Math.cos(pos._) * pos.c + pos.x : pos.x;
            node.y = type.level < 4 ? Math.sin(pos._) * pos.c + pos.y : pos.y;
            pos._ += pos.a;

            this.index.nodes[nodeId] = node;
            nodesToAdd.push(node);
        });

        this.nodes.add(nodesToAdd);
        this.edges.add(edgesToAdd);
        return resolve();
    });
};

/* remove
 *
 * remove a node from the graph
 *
 * nodeId = the id of the node that will be removed
 *
 */
exports.remove = function (nodeId) {
    return new Promise((resolve, reject) => {

        if (!nodeId) {
            return reject(new Error('Flow-visualizer.add: Missing nodeId.'));
        }

        let nodes = [];
        let edges = [];
        const index = this.index;

        const getChildren = (id) => {
            if (index.nodes[id]) {

                // remove edges
                index.nodes[id].o.forEach(edge => {
                    edges.push(edge);
                    index.edges[edge] = null;
                });

                // remove nodes
                index.nodes[id].children.forEach(_id => {
                    if (index.nodes[_id] && (index.nodes[_id].i === 0 || --index.nodes[_id].i === 0)) {
                        getChildren(_id);
                        nodes.push(_id);
                        index.nodes[_id] = null;
                    }
                });
            }
        };

        getChildren(nodeId);
        index.nodes[nodeId].children = [];
        this.nodes.remove(nodes);

        if (edges.length) {
            this.edges.remove(edges);
        }
    });
};

/* reset
 *
 * reset data to initial or given state
 *
 * data = {
 *     nodes: [],
 *     edges: []
 * }
 *
 */
exports.reset = (data) => {
    data = data || {};

    this.network.setData({
        nodes: data.nodes || [],
        edges: data.edges || []
    });
};