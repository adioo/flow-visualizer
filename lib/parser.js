'use strict'

module.exports = function (predicates, triples, types, target, pos, index) {
    triples.forEach(triple => {

        let config = predicates[triple[1]];
        if (!config || (!config.nodes && !config.edges)) {
            return console.error('Flow-visualizer.parse: Invalid triple "' + triple + '".');
        }

        Object.keys(config).forEach(category => config[category].forEach(map => {

            if (map.type && !types[map.type]) {
                return console.error('flow-visualizer.parse: type "' + map.type + '" not found for predicate "' + triple[1] + '".');
            }

            Parse(map, triple, map.type ? types[map.type][category] || {} : {}, target[category], pos, index)
        }));
    });
};

function Parse (map, triple, type, target, pos, index) {

    let parsed = {
        x: pos.x,
        y: pos.y
    };

    map.subject && map.subject.forEach(prop => parsed[prop] = triple[0]);
    map.object && map.object.forEach(prop => parsed[prop] = triple[2]);

    parsed.id = parsed.id || type.id || triple[0] + triple[2];
 
    add(Object.assign(parsed, type), target, index);
}

function add (object, target, index) {

    if (index[object.id]) {
        ++index[object.id];
        return;
    }

    index[object.id] = 1;
    target.push(object);
}
