import treeData from '../data/Portfolio_tree_FINAL.json' assert { type: 'json' };

// ISP_ptf_v2.json

// ***********************************************
// Ref: http://jsfiddle.net/z9tmgpwd/

function expand(d){   
    var children = (d.children)?d.children:d._children;
    if (d._children) {        
        d.children = d._children;
        d._children = null;       
    }
    if(children)
      children.forEach(expand);
}

function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
}

// Change the FONT SIZE **************************************
let sliderFontSize = document.getElementById("sliderFontSize");
let changeFontSize = () => {
    fontSize = +sliderFontSize.value+"px";
    console.log(fontSize);
    update(root);
}
sliderFontSize.onchange = changeFontSize;

// Change the NODE SIZE **************************************
let sliderNodeSize = document.getElementById("sliderNodeSize");
let changeNodeSize = () => {
    nodeScaleRanges.max = sliderNodeSize.value
    update(root);
}
sliderNodeSize.onchange = changeNodeSize;

// Change the NODE COLOR **************************************
let dropdownNodeColor = document.getElementById('dropdown_node_colors');
let changeNodeColor = () => {
    let selecetedIndex = dropdownNodeColor.selectedIndex;
    let selectedOption = dropdownNodeColor.options[selecetedIndex];
    node_color = metrics_map[selectedOption.text];
    update(root);
}
dropdownNodeColor.onchange = changeNodeColor;

// Change the PATH COLOR **************************************
let dropdownPathColor = document.getElementById('dropdown_path_colors');
let changePathColor = () => {
    let selecetedIndex = dropdownPathColor.selectedIndex;
    let selectedOption = dropdownPathColor.options[selecetedIndex];
    path_color = metrics_map[selectedOption.text];
    update(root);
}
dropdownPathColor.onchange = changePathColor;

// Change the SIZE METRIC **************************************
let dropdownSizeMetric = document.getElementById('dropdown_size');
let changeSizeBy = () => {
    let selecetedIndex = dropdownSizeMetric.selectedIndex;
    let selectedOption = dropdownSizeMetric.options[selecetedIndex];
    size_metric = metrics_map[selectedOption.text];
    update(root);
}
dropdownSizeMetric.onchange = changeSizeBy;

var metrics = {
    VAR: 'risk_metric',
    MTM: 'mtm',
    GROSS_MTM: 'abs_mtm',
    POSITIONS: 'positions'
}
var metrics_map = {
    'Select node color by:': metrics.VAR,
    'VaR': metrics.VAR,
    'Net MtM': metrics.MTM,
    'Gross MtM': metrics.GROSS_MTM,
    'Nr. of Positions': metrics.POSITIONS
}
var tree_parameters = {
    'NODE_COLOR': metrics.VAR,
    'PATH_CPLOR': metrics.VAR,
    'SIZE_METRIC': metrics.GROSS_MTM
}

// ***********************************************


var margin = { top: 20, right: 120, bottom: 20, left: 40 };
var width = 1300 - margin.left - margin.right;
var height = 700 - margin.top - margin.bottom;
var nodeScaleRanges = {min: 1, max:sliderNodeSize.value};
var fontSize = +sliderFontSize.value+"px";
var depthScaler = 50;
/* var metrics = {
    VAR: 'risk_metric',
    MTM: 'mtm',
    GROSS_MTM: 'abs_mtm',
    POSITIONS: 'positions'
}
var metrics_map = {
    'Select node color by:': metrics.VAR,
    'VaR': metrics.VAR,
    'Net MtM': metrics.MTM,
    'Gross MtM': metrics.GROSS_MTM
}
var tree_parameters = {
    'NODE_COLOR': metrics.VAR,
    'PATH_CPLOR': metrics.VAR,
    'SIZE_METRIC': metrics.GROSS_MTM
} */
var node_color = metrics.VAR;
var path_color = metrics.VAR;
var size_metric = metrics.GROSS_MTM;

var svg = d3
        .select(".container")
        .append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            //.attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var i = 0;
var duration = 750;
var root;

var treechart = d3.tree().size([height, width]);
root = d3.hierarchy(treeData, d => d.children);
root.x0 = height / 2;
root.y0 = 0;

update(root);

// ***********************************************
// Ref: http://jsfiddle.net/z9tmgpwd/
function expandAll(){
    expand(root); 
    update(root);
}


function collapseAll(){
    root.children.forEach(collapse);
    collapse(root);
    update(root);
}

function update(source) {

    // Tooltip: https://chartio.com/resources/tutorials/how-to-show-data-on-mouseover-in-d3js/#creating-a-tooltip-using-mouseover-events

    console.log(root.data)
    var treeData = treechart(source);
    // nodes
    var nodes = treeData.descendants();
/*     let nodeScaler = d3.scaleLinear()
                    .domain(
                        [d3.min(nodes, d => d.data.abs_mtm),
                        d3.max(nodes, d => d.data.abs_mtm)])
                    .range([nodeScaleRanges.min, nodeScaleRanges.max]); */
    
    nodes.forEach(d => d.depth * depthScaler);
    
    // This operation creates the bind between the elements of the chart
    // (i.e., the nodes) and the respective data, but actually does not
    // create any point in the chart; to do so it is required to call the
    // "enter" and "update" functions
    var node = svg
        .selectAll("g.node")
        .data(nodes, d => d.id || (d.id = ++i));
    
    // Select the NEW elements created in the binding
    var nodeEnter = node
        .enter()
        .append("g")
            .attr("class", "node")
            .attr("transform", d => "translate(" + source.y0 + ", " + source.x0 + ")")
        .on("click", click);

    nodeEnter
        .append("circle")
            .attr("class", "node")
            .attr("r", 0)
            .style("fill", d => d._children ? "grey" : "#fff");
    
    nodeEnter
        .append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d._children ? -6 : 6)
            .attr("text-anchor", d => d._children ? "end" : "start")
            .style("font-size", `${fontSize}`)
            .text(d => d.data.name)
                .clone(true).lower()
                .attr("stroke-linejoin", "round")
                .attr("stroke-width", 3)
                .attr("stroke", "white");
            

    // Select the data we already have and we want to update
    var nodeUpdate = nodeEnter.merge(node);

    nodeUpdate
        .transition()
        .duration(duration)
        .attr("transform", d => "translate(" + d.y + ", " + d.x + ")");

    nodeUpdate
        .select("circle.node")
            // Set the node diameter based on the specified node value
            .attr("r", d => dimension_scaler(d, size_metric)/2 +"px")
            .style("fill", d => d._children ? "grey" : "#fff")
            /* Set the color of the circle based on +/- values */
            .style("stroke", d => change_node_color(d, node_color))
            .attr("cursor", "pointer")
        
    // NEW *********************************
    /*
    nodeUpdate
        .select("text")
        .style("font-size", `${fontSize}`);
    */

    nodeUpdate
        .on("mouseover", (d) => mouseover(d))
        .on("contextmenu", (d) => node_details(d))
        //.on("dblclick", mouseout)
        //.on("mouseout", mouseout);

    // Select the elements we want to remove from the chart
    let nodeExit = node
        .exit()
        .transition()
        .duration(duration)
            .attr("transform", d => "translate(" + source.y + "," + source.x + ")")
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
    var link = svg.selectAll("path.link").data(links, d => d.id);
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
            .attr("d", d => diagonal(d, d.parent))
            /* Set the arch width based on the children value "other" */
            .style("stroke-width", d => dimension_scaler(d, size_metric) +"px")
            .style("stroke", d => change_link_color(d, path_color));

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
    };
    
    /* PERSONAL FUNCTIONS */

    function change_node_color(d, rm=metrics.VAR) {
        return d.data[rm]>0 ? "green" : "red";
    }
  
    function link_color(d) {
        return d.data.risk_metric>0 ? "#e0ffcd" : "#ffebbb";
    }

    function change_link_color(d, rm=metrics.VAR) {
        return d.data[rm]>0 ? "#e0ffcd" : "#ffebbb";
    }

    function dimension_scaler(d, rm=metrics.GROSS_MTM) {
        let scaler = d3.scaleLinear()
                    .domain(
                        [d3.min(nodes, d => Math.abs(d.data[rm])),
                        d3.max(nodes, d => Math.abs(d.data[rm]))])
                    .range([nodeScaleRanges.min, nodeScaleRanges.max]);
        return scaler(Math.abs(d.data[rm]));
    }

    function node_details(d) {
        let info = d.srcElement.__data__.data
        d.srcElement.addEventListener("contextmenu", (e) => {e.preventDefault()})
        let elem = d3.select("#tooltip")
        elem.select('.label').html(info.name)
        line_plot('node_chart', info.table.VaR)
        elem.style('display', "block")
    }

    function mouseover(d) {
        let info = d.srcElement.__data__.data
        let parent_info = d.srcElement.__data__.parent
        let risk = format_numbers(info.risk_metric, 'CCY')
        let mtm = format_numbers(info.mtm, 'CCY')
        let nr_positions = format_numbers(info.positions, 'NUM')
        let perc_risk = Math.abs(info.risk_metric/info.mtm*100).toFixed(1)
        let var_history = info.table.VaR
        //console.log(var_history)
        //let elem = d3.select("#tooltip")
        /* elem.select('.label').html(info.name)
        elem.select('.risk_tag').html('VaR: ' +risk + ' ('+perc_risk+'%)')
        elem.select('.mtm').html('MtM: ' +mtm)
        elem.select('.nr_positions').html('Nr. of Positions: ' +nr_positions) */
        gauge_chart('chart_highlight',
            { 'VaR': info.risk_metric, 'History': var_history },
            { 'Negligible': [-5e6, 0],
              'Low': [-25e6, -5e6],
              'Medium': [-50e6, -25e6],
              'High': [-100e6, -50e6] }
        )
        //elem.style('display', "block")

        fill_node_highlight(info, risk, mtm, nr_positions, perc_risk, parent_info)
        
    }

    /*
    function mousemove(d) {
        console.log(d);
        //console.log(tooltip);
        tooltip
            .html("VaR is: " + "CIAO")
            .style("left", (d.x) + "px")
            .style("top", (d.y) + "px")
            .style("display", "block")
    }
    */

    function mouseout() {
        document.getElementById("tooltip")
            .style.display="none"
        /*
        tooltip
            .transition()
            .duration(300)
            .style("opacity", 1e-6)
            */
    }

    function fill_node_highlight(info, risk, mtm, nr_positions, perc_risk, parent_info) {
        let highlight = d3.select("#node_highlight")
        let parent_name = parent_info != null ? parent_info.data.name : '-'
        highlight.select(".node_name").html(info.name)
        highlight.select(".node_risk").html('VaR: ' +risk + ' ('+perc_risk+'%)')
        highlight.select(".node_mtm").html('MtM: ' +mtm)
        highlight.select(".node_nr_positions").html('Nr. of Positions: ' +nr_positions)
        highlight.select(".node_parent").html('Parent: ', parent_name)
    }

    function format_numbers(data, typ) {
        if (typ === 'CCY') {
            let num = new Intl.NumberFormat(
                'it-IT',
                { style: 'currency', currency: 'EUR'}
            ).format(data)
            return num
        }
        else {
            let num = new Intl.NumberFormat(
                'it-IT'
            ).format(data)
            return num
        }
    }

    function gauge_chart(div_id, input, limits) {
        let var_array = Object.values(input['History'])
        var data = [
            {
                type: "indicator",
                mode: "gauge+number+delta",
                value: input['VaR'],
                title: { text: "VaR", font: { size: 18 } },
                delta: { reference: var_array[0]-var_array[1],
                         increasing: { color: "red" },
                         decreasing: { color: "limegreen" }
                        },
                gauge: {
                    axis: { range: [null, limits['High'][0]], tickwidth: 1, tickcolor: "darkblue" },
                    bar: { color: "black" },
                    bgcolor: "white",
                    borderwidth: 0,
                    bordercolor: "white",
                    steps: [
                    { range: limits['High'], color: "orangered" },
                    { range: limits['Medium'], color: "yellow" },
                    { range: limits['Low'], color: "lightgreen" },
                    { range: limits['Negligible'], color: "limegreen" }
                    ],
                    /* threshold: {
                        line: { color: "red", width: 4 },
                        thickness: 0.75,
                        value: 490
                    } */
                }
            }
            ];
          
        var layout = {
            width: 200,
            height: 200,
            margin: { t: 25, r: 25, l: 25, b: 25 },
            //paper_bgcolor: "lavender",
            //font: { color: "darkblue", family: "Arial" }
        };
          
        Plotly.newPlot(div_id, data, layout);
    }

    function line_plot(div_id, input) {
        var trace = {
            x: Object.keys(input),
            y: Object.values(input),
            type: 'scatter'
        }
        var layout = {
            title:'VaR time series'
        };
        Plotly.newPlot(div_id, [trace], layout)
    }

};

// ***********************************************

// Pulsanti per APRIRE/ CHIUDERE l'albero
// --------------------------------------------------------
let btnExpand = document.getElementById("expand_button");
let btnCollapse = document.getElementById("collapse_button");

btnExpand.onclick = expandAll;
btnCollapse.onclick = collapseAll;


// Dropdown menù per scegliere cosa visualizzare
// -------------------------------------------------------------
//const dropdownBtn = document.getElementById("nodecont_dropdown_btn");
//const dropdownMenu = document.getElementById("dropdown");
const toggleArrow = document.getElementById("arrow");

// Toggle dropdown function
const toggleDropdown = function () {
  dropdownMenu.classList.toggle("show");
  toggleArrow.classList.toggle("arrow");
};

// Toggle dropdown open/close when dropdown button is clicked
/* dropdownBtn.addEventListener("click", function (e) {
  e.stopPropagation();
  toggleDropdown();
});
 */
// Close dropdown when dom element is clicked
/* document.documentElement.addEventListener("click", function () {
  if (dropdownMenu.classList.contains("show")) {
    toggleDropdown();
  }
});
 */

let btnSideNavClose = document.getElementById("sidenav_close_btn");
btnSideNavClose.onclick = () => {document.getElementById("side_nav").style.display = "none"}

let btnSideNavOpen = document.getElementById("sidenav_open_btn");
btnSideNavOpen.onclick = () => {document.getElementById("side_nav").style.display = "block"}

let btnTooltipClose = document.getElementById("close_tooltip_btn");
btnTooltipClose.onclick = () => {document.getElementById("tooltip").style.display = "none"}

const node_wanted = document.querySelector("#search_node");
node_wanted.addEventListener("input", (e)=>{console.log(e.data)})

let btnFindNode = document.getElementById("find_node");
btnFindNode.onclick = () => {
    let found = root.find(d => d.data.name=='IRS TRADING')
    update(found.copy())
}