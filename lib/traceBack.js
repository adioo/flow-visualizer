"use strict"

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
