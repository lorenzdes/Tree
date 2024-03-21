  import treeData from '../data/ISP_ptf_v2.json' assert { type: 'json' };
  console.log(treeData);
  
  var margin = { top: 20, right: 90, bottom: 20, left: 90 };
  var width = 1850 - margin.left - margin.right;
  var height = 800 - margin.top - margin.bottom;
  
  var svg = d3
    .select(".container")
    .append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  var i = 0;
  var duration = 750;
  var root;
  
  var treemap = d3.tree().size([height, width]);
  root = d3.hierarchy(treeData, function (d) {
    return d.children;
  });
  root.x0 = height / 2;
  root.y0 = 0;
  //console.log("root ", root);
  
  update(root);
  
  function update(source) {
    var treeData = treemap(root);
  
    // nodes
    var nodes = treeData.descendants();
    nodes.forEach(function (d) {
      d.y = d.depth * 180;
    });
    var node = svg.selectAll("g.node").data(nodes, function (d) {
      return d.id || (d.id = ++i);
    });
    var nodeEnter = node
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", function (d) {
        return "translate(" + source.y0 + ", " + source.x0 + ")";
      })
      .on("click", click);
  
    nodeEnter
      .append("circle")
      .attr("class", "node")
      .attr("r", 0)
      .style("fill", function (d) {
        return d._children ? "grey" : "#fff";
      });
  
    nodeEnter
      .append("text")
      .attr("dy", ".35em")
      .attr("x", function (d) {
        return d.children || d._children ? -13 : 13;
      })
      .attr("text-anchor", function (d) {
        return d.children || d._children ? "end" : "start";
      })
      .text(function (d) {
        return d.data.name;
      });
  
    var nodeUpdate = nodeEnter.merge(node);
  
    nodeUpdate
      .transition()
      .duration(duration)
      .attr("transform", function (d) {
        return "translate(" + d.y + ", " + d.x + ")";
      });
  
    nodeUpdate
      .select("circle.node")
      /* Set the node diameter based on the node value "other" */
      .attr("r", function (d) {
        return node_dimension(d);
      })
      .style("fill", function (d) {
        return d._children ? "grey" : "#fff";
      })
      /* Set the color of the circle based on +/- values */
      .style("stroke", function (d) {
        return node_color(d);
      })
      .attr("cursor", "pointer");
  
    let nodeExit = node
      .exit()
      .transition()
      .duration(duration)
      .attr("transform", function (d) {
        return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();
  
    nodeExit.select("circle").attr("r", 0);
    nodeExit.select("text").style("fill-opacity", 0);
  
    // links
    function diagonal(s, d) {
      let path = `M ${s.y} ${s.x}
        C ${(s.y + d.y) / 2} ${s.x}
          ${(s.y + d.y) / 2} ${d.x}
          ${d.y} ${d.x}`;
      return path;
    }
    var links = treeData.descendants().slice(1);
    var link = svg.selectAll("path.link").data(links, function (d) {
      return d.id;
    });
    var linkEnter = link
      .enter()
      .insert("path", "g")
      .attr("class", "link")
      .attr("d", function (d) {
        var o = { x: source.x0, y: source.y };
        return diagonal(o, o);
      });
    var linkUpdate = linkEnter.merge(link);
    linkUpdate
      .transition()
      .duration(duration)
      .attr("d", function (d) {
        return diagonal(d, d.parent);
      })
      /* Set the arch width based on the children value "other" */
      .style("stroke-width", function (d) {
        return link_width(d);
      })
      .style("stroke", function (d) {
        return link_color(d);
      });
  
    var linkExit = link
      .exit()
      .transition()
      .duration(duration)
      .attr("d", function (d) {
        var o = { x: source.x0, y: source.y0 };
        return diagonal(o, o);
      })
      .remove();
  
    nodes.forEach(function (d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  
    function click(event, d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update(d);
    }
    
    /* PERSONAL FUNCTIONS */

    function scale_by(num, scaler = 50) {
      return num/root.data.abs_mtm*scaler;
    }

    function node_dimension(d) {
      return scale_by(d.data.abs_mtm)/2;
    }

    function node_color(d) {
      return d.data.risk_metric>0 ? "green" : "red";
    }

    function link_width(d) {
      return scale_by(d.data.abs_mtm)+"px";
    }

    function link_color(d) {
      return d.data.risk_metric>0 ? "#e0ffcd" : "#ffebbb";
    }

    /* Mouse over stuff */
  }