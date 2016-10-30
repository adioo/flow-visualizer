'use strict'

const isTouchDevice = 'd' in document.documentElement;

module.exports = (scope, options) => {

    const network = scope.network;

    if (isTouchDevice) {
        // Highlight traceback on click
        network.on('click', traceBack);
    } else {
        // Highlight traceback on hover
        network.on('hoverNode', function(params) {
            traceBack(params.node);
        });
        // un-traceback on un-hover
        network.on('blurNode', resetTrace);
    }

    // Click > Expand/Collaps sub tree
    network.on('click', event => expandCollapse(scope, event));

    // Click & Hold > show context menu
    network.on('hold', contextMenu);

    // 2x Click > show detail form
    network.on('doubleClick', detailView);
};

function expandCollapse (scope, event) {

    const node = event.nodes.length ? scope.nodes.get(event.nodes[0]) : null;

    switch (node.state) {
        case 'expanded':
            // TODO hide subtree
            node.state = 'collapsed';
            break;
        case 'loading':
            return;
        default:
            node.state = 'expanded';
    }

    scope.nodes.update(node);
    scope.flow(scope._name + '/expand').write(node);
}
function contextMenu () {console.log('Context menu:', arguments)}
function detailView () {console.log('Detail view:', arguments)}
function traceBack () {

    //console.log('Trace back:', arguments);

    // TODO touch traceback
    /*if (params.nodes.length) { //Was the click on a node?
        //The node clicked
        var page = params.nodes[0];
        //Highlight in blue all nodes tracing back to central node
        traceBack(page);
    } else {
        resetProperties();
    }*/

    /*if (node != selectedNode) {
        selectedNode = node;
        resetProperties();
        tracenodes = getTraceBackNodes(node);
        traceedges = getTraceBackEdges(tracenodes);
        //Color nodes yellow
        var modnodes = tracenodes.map(function(i){return nodes.get(i);});
        colorNodes(modnodes, 1);
        //Widen edges
        var modedges = traceedges.map(function(i){
            var e=edges.get(i);
            e.color={inherit:"to"};
                return e;
        });
        edgesWidth(modedges, 5);
    }*/
}

function resetTrace () {

    //console.log('Reset trace:', arguments);

    /*if (!isReset) {
        selectedNode = null;
        //Reset node color
        var modnodes = tracenodes.map(function(i){return nodes.get(i);});
        colorNodes(modnodes, 0);
        //Reset edge width and color
        var modedges = traceedges.map(function(i){
            var e=edges.get(i);
            e.color=getEdgeColor(nodes.get(e.to).level);
            return e;
        });
        edgesWidth(modedges, 1);
        tracenodes = [];
        traceedges = [];
    }*/
}
