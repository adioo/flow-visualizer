'use strict';

/* parse
 *
 * parse triples array into nodes and edges
 *
 * triples = [] - the array of RDF triples
 *
 *
 */
exports.parse = function (triples) {
    // TODO needs more work
    // use promises
    // improve the type asignation (add colors, vis.js options, etc)

    let result = {
        nodes: {},
        edges: {}
    };

    const node_types = this.config.parse.nodes.types;
    const edge_types = this.config.parse.edges.types;

    triples.forEach(triple => {

        const parserMap = this.config.parse.triples[triple[1]];
        if (!parserMap) {
            return;
        }

        // construct nodes and edges
        Object.keys(parserMap).forEach(category => {
            let map = parserMap[category];

            if (category === 'node') {
                let id = triple[0];

                // create or get node
                result.nodes[id] = result.nodes[id] || {children: [], o: [], i: 0};

                // add data to element
                map.object && map.object.forEach(prop => {

                    if (prop === 'type') {
                        Object.keys(node_types).forEach(typeName => {
                            let typeObj = node_types[typeName];

                            if (typeObj.rdfType === triple[2]) {
                                result.nodes[id].type = typeName;
                            }
                        });
                    } else {
                        result.nodes[id][prop] = triple[2];
                    }
                });
                map.subject && map.subject.forEach(prop => result.nodes[id][prop] = triple[0]);

            } else if (category === 'edge') {
                let id = triple[0] + '-' + triple[2];
                result.edges[id] = {
                    id: id
                };

                map.subject && map.subject.forEach(prop => result.edges[id][prop] = triple[0]);
                map.object && map.object.forEach(prop => result.edges[id][prop] = triple[2]);

                Object.keys(edge_types).forEach(typeName => {
                    let typeObj = node_types[typeName];

                    if (typeObj.rdfType === triple[1]) {
                        type = typeObj;
                        result.nodes[id].type = typeName;
                    }
                });
            }
        });
    });

    Object.keys(result.nodes).forEach(nodeId => {
        let node = result.nodes[nodeId];

        if (!node.type) {
            throw new Error('Flow-visualizer: Invalid type for node ' + nodeId);
        }
        let type = node_types[node.type];

        // get colors
        let styles = {color: {}};
        if (this.config.colors[type.color]) {
            styles.color = this.config.colors[type.color];
        } else {
            throw new Error('Flow-visualizer: Color ' + type.color + ' not found for type ' + type + '.')
        }
        node.styles = styles;
    });

    Object.keys(result.edges).forEach(edgeId => {
        let edge = result.edges[edgeId];

        if (!edge.type) {
            throw new Error('Flow-visualizer: Invalid type for edge ' + edgeId);
        }
        let type = edge_types[edge.type];

        // get color config
        if (this.config.colors[type.color]) {
            styles.color = this.config.colors[type.color];
            styles.color = {
                color: styles.color.background,
                highlight: styles.color.highlight.background,
                hover: styles.color.hover.background,
                inherit: 'to'
            }
        } else {
            throw new Error('Flow-visualizer: Color ' + type.color + ' not found for type ' + type + '.')
        }
    });

    return result;
};