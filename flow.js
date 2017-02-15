'use strict';

const VIS = require('./index');

exports.init = (scope, state, args, data, next) => {

    if (!args.parse) {
        return next(new Error('Flow-visualizer.init: No parse config found.'));
    }

    if (!args.events) {
        return next(new Error('Flow-visualizer.init: No event interface config found.'));
    }

    if (!args.view || !document.querySelector(args.view)) {
        return next(new Error('Flow-visualizer: DOM data.node not found.'));
    }

    state.VIS = VIS(args);

    return next(null, data);
};

exports.add = (scope, state, args, data, next) => {

    return next(null, data);
};

exports.remove = (scope, state, args, data, next) => {

    return next(null, data);
};

exports.reset = (scope, state, args, data, next) => {

    return next(null, data);
};

exports.parse = (scope, state, args, data, next) => {

    return next(null, data);
};

exports.getSelectedNode = (scope, state, args, data, next) => {

    return next(null, data);
};

exports.zoom = (scope, state, args, data, next) => {

    return next(null, data);
};

exports.focus = (scope, state, args, data, next) => {

    return next(null, data);
};

exports.select = (scope, state, args, data, next) => {

    return next(null, data);
};