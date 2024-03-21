var canvas = d3.select("body").append("svg")
    .attr("width", 500)
    .attr("height", 500)
    .append(g)
        .attr("transform", "translate(50, 50)");

var tree = d3.layout.tree()
    .size([400, 400]);

d3.json("../data/input.json", function(data) {
    var nodes = tree.nodes(data);
    var links = tree.links(nodes);
    console.log(links);
})
