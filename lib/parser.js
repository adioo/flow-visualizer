"use strict"

module.exports = function (predicates, triples, types, target, pos, index) {

    pos.a = 360 / triples.length;
    pos.c = (pos.l * 0.5) / Math.cos(pos.a * 0.5) + /*TODO: make spring constance configurable:*/95/**/ + pos.l;
    pos._ = 0;//Math.atan2(pos.y - pos.parent.y, pos.x - pos.parent.x) * (180 / Math.PI);

    triples.forEach(triple => {

        let config = predicates[triple[1]];
        if (!config) {
            return console.error('Flow-visualizer.parse: Invalid triple "' + triple + '".');
        }

        if (!config.nodes && !config.edges) {
            return console.error('Flow-visualizer.parse: Invalid config "' + triple[1] + '".', config);
        }

        Object.keys(config).forEach(category => config[category].forEach(map => {

            if (map.type && !types[map.type]) {
                return console.error('flow-visualizer.parse: type "' + map.type + '" not found for predicate "' + triple[1] + '".');
            }

            const type = map.type ? types[map.type][category] || {} : {};
            let element = {id: type.id || triple[0] + triple[2]};

            map.inc = map.inc === undefined ? true : !!map.inc;
            map.out = map.out === undefined ? true : !!map.out;
            map.child = map.child === undefined ? true : !!map.child;
            map.subject && map.subject.forEach(prop => element[prop] = triple[0]);
            map.object && map.object.forEach(prop => element[prop] = triple[2]); 

            element = Object.assign(element, type);

            if (category === 'nodes') {

                // create or get indexed element
                index.nodes[element.id] = index.nodes[element.id] || {children: [], o: [], i: 0};

                // add child to parent
                element.parent = target.node.id;
                index.nodes[element.parent] = index[category][element.parent] || {children: [], o: [], i: 0};
                map.child && index.nodes[element.parent].children.push(element.id);

                if (!index[category][element.id].add) {

                    // set position
                    element.x = type.level < 4 ? Math.cos(pos._) * pos.c + pos.x : pos.x;
                    element.y = type.level < 4 ? Math.sin(pos._) * pos.c + pos.y : pos.y;
                    pos._ += pos.a;

                    // add node to visualization
                    index[category][element.id].add = true;
                    target[category].push(element);
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
                    target[category].push(element);
                }
            }
        }));
    });
};
