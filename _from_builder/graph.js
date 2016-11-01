'use strict';

// Dependencies
const vis = require('vis');
const Parser = require('./parser');
const jQuery = require('jquery');
const typeahead = require('typeahead.js-browserify');
const Bloodhound = typeahead.Bloodhound;
typeahead.loadjQueryPlugin();

class Graph {
    constructor(api, containerSelector = '.graph', visOptions = {}) {
        this._api = api; // save the api refrence
        this._container = document.querySelector(containerSelector);

        // initialize the vis.js graph
        this._network = new vis.Network(this._container, {}, visOptions);
        this._data = {
            nodes: new vis.DataSet([]),
            edges: new vis.DataSet([])
        };
        this._network.setData(this._data);
        this._hiddenNodes = [];

        // setup typeahead
        this.bloodhound = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.whitespace,
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: []
        });
        let  self = this;
        jQuery('.input-search').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        },
        {
            name: 'nodes',
            source: this.bloodhound
        });
    }

    /*
     *
     * builds the initial state of the graph
     * @name render
     *
     */
    render(resource = 'instances', callback) {
        let self = this;

        // fetch instances
        self._getGraphResource(resource, (err, data) => {

            if (err) {
                return callback(err);
            }

            self.append(data);
            this._updateBloodHound();
            callback(null);
        });
    }

    /*
     *
     * search for a node in the graph
     * @name search
     *
     */
    search(data) {
        let nodes = this._data.nodes._data;

        // find the right node
        let result = null;
        Object.keys(nodes).forEach(function (id) {
            let node = nodes[id];
            if (node.label === data.value) {
                result = node;
            }
        });

        if (!result) {
            return;
        }

        // focus and select node
        this._network.focus(result.id, {
            scale: 0.9
        });

        this._network.setSelection({ nodes: [result.id]}, { unselectAll: true });
    }
    /*
     *
     * appends new data to the graph
     * @name append
     *
     */
    append(data) {
        if (data.nodes.length) {
            // check if node already exists
            data.nodes.forEach((node) => {
                if (!this._data.nodes._data[node.id]) {
                    this._data.nodes.add(node);   
                }
            });
        }
        if (data.edges.length) {
            this._data.edges.add(data.edges);
        }
    }

    /*
     *
     * shows or hides an instance or event and their subgraphs
     * @name toggleVisibility
     *
     */
    toggleVisibility(nodeId, callback) {
        let node = this._data.nodes._data[nodeId];

        if (!node) {
            return callback(null);
        }

        // this should only work for instances and events (for now)
        if (node.type !== 'instance' && node.type !== 'event') {
        //    return callback(null);
        }

        this._network.unselectAll();

        // toggle node
        if (node.dataVisible) {
            // find the nodes that need to be hidden
            let nodesToBeHidden = [];
            Object.keys(this._data.edges._data).forEach((edgeId) => {
                let edge = this._data.edges._data[edgeId];

                if (edge.from === nodeId) {
                    nodesToBeHidden.push(edge.to);
                }
            });


            nodesToBeHidden.forEach((nodeId) => {
                this._hiddenNodes[nodeId] = this._data.nodes._data[nodeId];
                this._data.nodes.remove(nodeId);
            });

            node.dataVisible = false;
            this._updateBloodHound();
            callback(null);
        } else {
            // check if node already has subgraph fetched
            if (node.dataAvailable) {
                // find the nodes that need to be shown
                let nodesToBeShown = [];
                Object.keys(this._data.edges._data).forEach((edgeId) => {
                    let edge = this._data.edges._data[edgeId];

                    if (edge.from === nodeId) {
                        nodesToBeShown.push(edge.to);
                    }
                });

                Object.keys(this._hiddenNodes).forEach((nodeId) => {
                    let hiddenNode = this._hiddenNodes[nodeId];

                    if (nodesToBeShown.indexOf(nodeId) >= 0) {
                        this._data.nodes.add(hiddenNode);
                        delete this._hiddenNodes[nodeId];
                    }
                });

                this._updateBloodHound();
                node.dataVisible = true;
                callback(null);
            } else {
                let resource;
                if (node.type === 'entrypoint') {
                    resource = 'entrypoints/' + node.label + '/dependencies';
                } else if (node.type === 'module') {
                    resource = 'instances?module=' + node.owner + '/' + node.name;
                } else if (node.type === 'instance') {
                    resource = 'instances/' + node.label;
                } else if (node.type === 'event') {
                    let splits = node.id.split('/').filter(Boolean);
                    resource = 'instances/' + splits[splits.length - 2] + '/event/' + splits[splits.length - 1];
                } else {
                    return callback(null);
                }

                this.render(resource, (err) => {

                    if (err) {
                        return callback(err);
                    }

                    node.dataAvailable = true;
                    node.dataVisible = true;
                    callback(null);
                });
            }
        }
    }

    /*
     *
     * events
     * @name on
     *
     */
    on(eventName, callback) {

        if (eventName === 'searchNode') {

            jQuery('.input-search').on('keyup', function (e) {
                if (e.keyCode == 13) {
                    callback({ value: jQuery(this).val() });
                }
            });

            return;
        }

        this._network.on(eventName, (event) => {

            if (eventName === 'click') { // custom code for the click event

                callback({
                    nodeId: event.nodes[0]
                });
            } else {
                callback(event);
            }
        });
    }

    _updateBloodHound() {
        let labels = [];
        let nodes = this._data.nodes._data;
        this.bloodhound.clear();

        // find the right node
        let result = null;
        Object.keys(nodes).forEach(function (id) {
            let node = nodes[id];
            labels.push(node.label);
        });
        this.bloodhound.add(labels);
    }

    /*
     *
     * returns a specific resource (that can be renderd in a graph) as a collection of nodes and edges
     * @name _getGraphResource
     * @private
     *
     */
    _getGraphResource(resource, callback) {

        // compute the resource type
        let url = resource.split('?')[0];
        let splits = url.split('/').filter(Boolean);
        let type;

        if (splits.length === 1 && splits[0] === 'entrypoints') {
            type = 'entrypoints';
        } else if (splits.length === 3 && splits[0] === 'entrypoints' && splits[2] === 'dependencies') {
            type = 'modules';
        } else if (splits.length === 1 && splits[0] === 'instances') {
            type = 'instances';
        } else if (splits.length === 2) {
            type = 'instance';
        } else if (splits.length === 4) {
            type = 'event';
        } else {
            return callback(new Error('Builder.Graph._getGraphResource: Could not compute resource type.'));
        }

        // fetch data from api
        this._api.get(resource, (err, data) => {

            if (err) {
                return callback(err);
            }

            var parsedData = Parser.parse(data, type);

            // check if all went ok
            if (parsedData instanceof Error) {
                return callback(parsedData);
            }

            callback(null, parsedData);
        });
    }
}

module.exports = Graph;