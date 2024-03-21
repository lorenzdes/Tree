// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/tree
// https://observablehq.com/@d3/collapsible-tree

import treeData from '../data/ISP_ptf_v2.json' assert { type: 'json' };

var margin = { top: 20, right: 90, bottom: 20, left: 90 };
var width = 1850 - margin.left - margin.right;
//var height = 800 - margin.top - margin.bottom;

//let margin = ({top: 10, right: 120, bottom: 10, left: 40})
let dimensions = {dx: 10, dy: 192}

function TreeBuild(treeData,
                   margin,
                   width,
                   dimensions
    ) {

    const root = d3.hierarchy(treeData);

    root.x0 = dimensions.dy / 2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
        d.id = i;
        d._children = d.children;
        if (d.depth && d.data.name.length !== 7) d.children = null;
    });

    // LOG
    console.log(root);

    // Create the CANVAS
    const svg = d3
        .select("container")
        .append("svg")
        .attr("viewBox", [-margin.left, -margin.top, width, dimensions.dx])
        .style("font", "8px sans-serif")
        .style("user-select", "none")
        .append("g");

    // Create the LINK object
    const Link = svg
        .select("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5);

    // Create the NODE object
    const Node = svg
        .select("g")
        .attr("cursor", "pointer")
        .attr("pointer-events", "all");


    function update(source) {
        // Check whether it is necessary
        const duration = d3.event && d3.event.altKey ? 2500 : 250;
        // Get the NODES
        const nodes = root.descendants().reverse();
        // Get the LINKS
        const links = root.links();

        // Compute the TREE LAYOUT
        d3.tree().nodeSize([dimensions.dx, dimensions.dy])(root);
        let diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

        let left = root;
        let right = root;
        root.eachBefore(node => {
            if (node.x < left.x) left = node;
            if (node.x > right.x) right = node;
        });

        const height = right.x - left.x + margin.top + margin.bottom;

        const transition = svg.transition()
            .duration(duration)
            .attr("viewBox", [-margin.left, left.x - margin.top, width, height])
            .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));
        
        // Update the nodes
        const node = Node
            .selectAll("g")
            .data(nodes, d => d.id);

        // Enter any new nodes at the parent's previous position
        const nodeEnter = node
            .enter()
            //.append("g") // CORRETTO???
            .select("g")
            .attr("transform", d => `translate(${source.y0},${source.x0})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0)
            .on("click", (event, d) => {
            d.children = d.children ? null : d._children;
            update(d);
            });

        nodeEnter
            .append("circle")
            .attr("r", 2.5)
            .attr("fill", d => d._children ? "#555" : "#999")
            .attr("stroke-width", 10);

        nodeEnter
            .append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d._children ? -6 : 6)
            .attr("text-anchor", d => d._children ? "end" : "start")
            .text(d => d.data.name)
            .clone(true).lower()
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .attr("stroke", "white");

        // Transition nodes to their new position.
        const nodeUpdate = node.merge(nodeEnter).transition(transition)
            .attr("transform", d => `translate(${d.y},${d.x})`)
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        const nodeExit = node.exit().transition(transition).remove()
            .attr("transform", d => `translate(${source.y},${source.x})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0);

        // Update the links…
        const link = Link
            .selectAll("path")
            .data(links, d => d.target.id);

        // Enter any new links at the parent's previous position.
        const linkEnter = link.enter().append("path")
            .attr("d", d => {
            const o = {x: source.x0, y: source.y0};
            return diagonal({source: o, target: o});
            });

        // Transition links to their new position.
        link.merge(linkEnter).transition(transition)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition(transition).remove()
            .attr("d", d => {
            const o = {x: source.x, y: source.y};
            return diagonal({source: o, target: o});
            });

        // Stash the old positions for transition.
        root.eachBefore(d => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    update(root);

    return svg.node();
}

TreeBuild(treeData, margin, width, dimensions)