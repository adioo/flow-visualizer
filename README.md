# flow-visualizer
Interactive visualization of flow graphs.


### Config example

see vis.js docs for more [options](http://visjs.org/docs/network/#options)
``` javascript
    {
        container: '.GRAPH', // required
        vis: { // vis.js options, optional
            manipulation: {...},
            physics: {...},
            interaction: {...}
            nodes: {...},
            edges: {...},
        },
        colors: { // predefined color templates that will be used for nodes, edges, buttons. Optional
            COLOR_NAME: {
                border: 'COLOR_CODE',
                background: 'COLOR_CODE',
                highlight: {
                    border: 'COLOR_CODE',
                    background: 'COLOR_CODE'
                },
                hover: {
                    border: 'COLOR_CODE',
                    background": 'COLOR_CODE'
                }
            }
        },
        buttons: { // predefined button templates
            BUTTON_NAME: {
                emit: 'EVENT_NAME',
                color: 'COLOR_TEMPLATE_NAME'
            }
        },
        parse: { // information about nodes and endges used by the RDF parser. Required
            nodes: {
                events: { // vis.js node events that will be handled and passed forward
                    VIS_NODE_EVENT_NAME: 'EVENT_NAME_THAT_WILL_BE_EMITTED'
                },
                types: {
                    NODE_TYPE: {
                        rdfType: '', // RDF IRI that coresponds to this node
                        vis: {...} // overwrite vis.js options for this node type. Optional,
                        color: 'COLOR_CODE',
                        buttons: [ // buttons that will be rendered for this node type
                            {
                                type: 'BUTTON_NAME',
                                label: 'BUTTON_LABEL',
                                data: {...} // will be added to the render button event
                            }
                        ]
                    }
                }
            },
            edges: {
                events: { // vis.js edge events that will be handled and passed forward
                    VIS_EDGE_EVENT_NAME: 'EVENT_NAME_THAT_WILL_BE_EMITTED'
                },
                types: {
                    EDGE_TYPE: {
                        rdfType: '', // RDF IRI that coresponds to this edge
                        vis: {...} // overwrite vis.js options for this edge type. Optional,
                        color: 'COLOR_CODE',
                        buttons: [ // buttons that will be rendered for this edge type
                            {
                                type: 'BUTTON_NAME',
                                label: 'BUTTON_LABEL',
                                data: {...} // will be added to the render button event
                            }
                        ]
                    }
                }
            },
            triples: {
                "RDF_TRIPLE_PREDICATE_IRI": {
                    "nodes/edges": [{
                        "object": ["ELEMENT_PROPERTY"], // the triple object will be added to the created node/edge
                        "subject": ["ELEMENT_PROPERTY"] // the triple subject will be added to the created node/edge
                    }]
                }
            }
        }
    }
```
