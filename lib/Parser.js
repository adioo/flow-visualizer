'use strict';

function Parser (options) {

    this.config = options.config;
};

Parser.prototype.parse = function (triples, pos, index) {
    let self = this;

    let result = {
        nodes: {},
        edges: {}
    };

    // default values
    if (!index) {
        index = {
            nodes: {},
            edges: {}
        };
    }

    if (!pos) {
        pos = {
            x: 0,
            y: 0
        }
    };

    pos.a = 360 / triples.length;
    pos.c = (pos.l * 0.5) / Math.cos(pos.a * 0.5) + /*TODO: make spring constance configurable:*/95/**/ + pos.l;
    pos._ = 0;//Math.atan2(pos.y - pos.parent.y, pos.x - pos.parent.x) * (180 / Math.PI);

    const node_types = self.config.nodes.types;
    const edge_types = self.config.edges.types;

    triples.forEach(triple => {

        const parserMap = self.config.parse[triple[1]];
        if (!parserMap) {
            return new Error('Flow-visualizer.parse: Invalid type on triple:' + triple + '.');
        }

        Object.keys(parserMap).forEach(category => parserMap[category].forEach(map => {

            if (map.type && !self.config[category].types[map.type]) {
                //return new Error('flow-visualizer.parse: type ' + map.type + ' not found for predicate ' + triple[1] + '.');
            }

            const type = map.type ? self.config[category].types[map.type] || {} : {};
            let element = {
                id: type.id || triple[0] + triple[2],
                events: self.config.nodes.events || {},
                expand: self.config.nodes.expand === undefined ? true : !! self.config.nodes.expand,
                open: self.config.nodes.open === undefined ? true : !!self.config.nodes.open
            };

            map.inc = map.inc === undefined ? true : !!map.inc;
            map.out = map.out === undefined ? true : !!map.out;
            map.child = map.child === undefined ? true : !!map.child;
            map.subject && map.subject.forEach(prop => element[prop] = triple[0]);
            map.object && map.object.forEach(prop => element[prop] = triple[2]);

            // get color config
            const styles = {color: {}};
            if (typeof type.color === 'string') {
                if (self.config.colors[type.color]) {
                    styles.color = self.config.colors[type.color];
                    if (category === 'edges') {
                        styles.color = {
                            color: styles.color.background,
                            highlight: styles.color.highlight.background,
                            hover: styles.color.hover.background,
                            inherit: 'to'
                        }
                    }
                } else {
                    return new Error('Flow-visualizer: Color ' + type.color + ' not found for type ' + type + '.')
                }
            } else if (category === 'edges') {
                styles.color.inherit = 'to';
            }

            element = Object.assign(element, type, styles);

            if (category === 'nodes') {

                // create or get indexed element
                index.nodes[element.id] = index.nodes[element.id] || {children: [], o: [], i: 0};

                // add child to parent
                element.parent = result.node.id;
                index.nodes[element.parent] = index[category][element.parent] || {children: [], o: [], i: 0};
                map.child && index.nodes[element.parent].children.push(element.id);

                if (!index[category][element.id].add) {

                    // set position
                    element.x = type.level < 4 ? Math.cos(pos._) * pos.c + pos.x : pos.x;
                    element.y = type.level < 4 ? Math.sin(pos._) * pos.c + pos.y : pos.y;
                    pos._ += pos.a;

                    // add node to visualization
                    index[category][element.id].add = true;
                    result[category].push(element);
                }

            } else if (category === 'edges') {

                // add outgoing edge to node
                if (element.from) {
                    index.nodes[element.from] = index.nodes[element.from] || {children: [], o: [], i: 0};
                    map.out && index.nodes[element.from].o.push(element.id);
                }

                // count incoming edges
                if (element.to) {
                    index.nodes[element.to] = index.nodes[element.to] || {children: [], o: [], i: 0};
                    map.inc && ++index.nodes[element.to].i;
                }

                if (!index[category][element.id]) {
                    index[category][element.id] = 1;
                    result[category].push(element);
                }
            }
        }));
    });

    return result;
};

module.exports = Parser;