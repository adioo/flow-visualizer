'use strict'

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

            map.subject && map.subject.forEach(prop => element[prop] = triple[0]);
            map.object && map.object.forEach(prop => element[prop] = triple[2]);

            if (index[category][element.id]) {
                return;
            }

            element = Object.assign(element, type);

            // set node position
            if (category === 'nodes') {

                element.x = type.level < 4 ? Math.cos(pos._) * pos.c + pos.x : pos.x;
                element.y = type.level < 4 ? Math.sin(pos._) * pos.c + pos.y : pos.y;
                pos._ += pos.a;

                element.parent = target.node.id;

                index.nodes[element.id] = {children: [], out: []};
                index.nodes[element.parent] = index[category][element.parent] || {children: [], out: []};
                index.nodes[element.parent].children.push(element.id);

            // add edge to node out
            } else if (element.from) {
                index.nodes[element.from] = index.nodes[element.from] || {children: [], out: []};
                index.nodes[element.from].out.push(element.id);
                index.edges[element.id] = 1;
            }

            target[category].push(element);
        }));
    });
};
