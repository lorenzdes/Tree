//import treeData from '../data/Tree_mod_cvartree3.json' assert { type: 'json' };
import treeDataVaR from '../data/Tree_mod_cvartree3.json' assert { type: 'json' };
import treeDataSVaR from '../data/Tree_mod_SVAR_cvartree3.json' assert { type: 'json' };

import {
    metrics, metrics_map, tree_parameters,
    look_in, data_positions, datasets
} from './utils/namespace.js'
import {
    find_new_subTree, expand, collapse, format_numbers, get_cvar_other
} from './utils/auxiliary_functions.js'
import{
    fill_node_highlight, fill_root
} from './utils/tooltips.js'


let CURRENT_ROOT;
let BASE_ROOT;


// Change the FONT SIZE **************************************
/* let sliderFontSize = document.getElementById("sliderFontSize");
let changeFontSize = () => {
    fontSize = +sliderFontSize.value+"px";
    update(CURRENT_ROOT);
}
sliderFontSize.onchange = changeFontSize; */

let treeData = treeDataVaR; // -------------------------------------------------------------------------------

let dropdownRiskMeasure = document.getElementById('dropdown_attribution');
let changeDataset = () => {
    let selecetedIndex = dropdownRiskMeasure.selectedIndex;
    let selectedOption = dropdownRiskMeasure.options[selecetedIndex];
    treeData = selectedOption.text === 'VaR' ? treeDataVaR : treeDataSVaR;
    console.log(treeData)
    compute_root(treeData)
}
dropdownRiskMeasure.onchange = changeDataset;

// Change the NODE SIZE **************************************
let sliderNodeSize = document.getElementById("sliderNodeSize");
let changeNodeSize = () => {
    nodeScaleRanges.max = sliderNodeSize.value
    update(CURRENT_ROOT);
}
sliderNodeSize.onchange = changeNodeSize;

// Change the NODE COLOR **************************************
let dropdownNodeColor = document.getElementById('dropdown_node_colors');
let changeNodeColor = () => {
    let selecetedIndex = dropdownNodeColor.selectedIndex;
    let selectedOption = dropdownNodeColor.options[selecetedIndex];
    node_color = metrics_map[selectedOption.text];
    update(CURRENT_ROOT);
}
dropdownNodeColor.onchange = changeNodeColor;

// Change the PATH COLOR **************************************
let dropdownPathColor = document.getElementById('dropdown_path_colors');
let changePathColor = () => {
    let selecetedIndex = dropdownPathColor.selectedIndex;
    let selectedOption = dropdownPathColor.options[selecetedIndex];
    path_color = metrics_map[selectedOption.text];
    update(CURRENT_ROOT);
}
dropdownPathColor.onchange = changePathColor;

// Change the SIZE METRIC **************************************
let dropdownSizeMetric = document.getElementById('dropdown_size');
let changeSizeBy = () => {
    let selecetedIndex = dropdownSizeMetric.selectedIndex;
    let selectedOption = dropdownSizeMetric.options[selecetedIndex];
    size_metric = metrics_map[selectedOption.text];
    update(CURRENT_ROOT);
}
dropdownSizeMetric.onchange = changeSizeBy;

// ***********************************************


var margin = { top: 20, right: 120, bottom: 20, left: 40 };
var width = 1300 - margin.left - margin.right; // 1300
var height = 800 - margin.top - margin.bottom; // 800
var nodeScaleRanges = {min: 1, max:sliderNodeSize.value};
var fontSize = '9px'//+sliderFontSize.value+"px";
var depthScaler = 50;

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

function compute_root(dataset) {
    root = d3.hierarchy(dataset, d => d.children);
    root.x0 = height / 2;
    root.y0 = 0;
    BASE_ROOT = root
    CURRENT_ROOT = root

    fill_root(BASE_ROOT)
    update(BASE_ROOT);
}

/* root = d3.hierarchy(treeData, d => d.children);
root.x0 = height / 2;
root.y0 = 0; */

/* BASE_ROOT = root
CURRENT_ROOT = root

fill_root(BASE_ROOT)
update(BASE_ROOT); */

// ***********************************************
// Ref: http://jsfiddle.net/z9tmgpwd/
function expandAll(){
    expand(CURRENT_ROOT); 
    update(CURRENT_ROOT);
}


function collapseAll(){
    CURRENT_ROOT.children.forEach(collapse);
    collapse(CURRENT_ROOT);
    update(CURRENT_ROOT);
}


function back2baseroot() {
    CURRENT_ROOT = BASE_ROOT;
    expandAll();
}

function update(source) {

    // Tooltip: https://chartio.com/resources/tutorials/how-to-show-data-on-mouseover-in-d3js/#creating-a-tooltip-using-mouseover-events

    var treeData = treechart(CURRENT_ROOT);
    // nodes
    var nodes = treeData.descendants();

    let dpListNodes = document.getElementById("nodes_list");
    nodes.forEach(function(item){
        var option = document.createElement('option');
        option.value = item.data.name;
        dpListNodes.appendChild(option);
    })
    
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

/*     function get_risk_metric(d, rm) {
        if (rm === metrics.CVAR) {
            if (d.data.name === "BANCA") {
                return d.data[metrics.VAR]
            }
            else {
                d.parent.data.results.results_250[d.data.name][rm]}
        }
        else {return d.data[rm]}
    } */

    function get_node_data(d, what, res='results_250') {
        let where = data_positions[what]
        if (where === look_in.NODE) {
            return d.data[what]
        }
        else {
            if (what === metrics.CVAR && d.data.name === 'BANCA') {
                return d.data[metrics.VAR]
            }
            else { return d.parent.data.results[res][d.data.name][what] }
        }
    }

    function change_node_color(d, rm=metrics.VAR) {
        return get_node_data(d, rm)>0 ? "green" : "red";
    }
  
    function link_color(d) {
        return d.data.risk_metric>0 ? "#e0ffcd" : "#ffebbb";
    }

    function change_link_color(d, rm=metrics.VAR) {
        return d.data[rm]>0 ? "#e0ffcd" : "#ffebbb";
    }

    function dimension_scaler(d, rm=metrics.GROSS_MTM) {
/*         let toBeScaled = (rm === metrics.CVAR) ? get_cvar_other(d) : d.data[rm]
        let scaler = d3.scaleLinear()
                    .domain(
                        [d3.min(nodes, d => Math.abs((rm === metrics.CVAR) ? get_cvar_other(d) : d.data[rm])),
                        d3.max(nodes, d => Math.abs((rm === metrics.CVAR) ? get_cvar_other(d) : d.data[rm]))])
                    .range([nodeScaleRanges.min, nodeScaleRanges.max]); */
        let scaler = d3.scaleLinear()
                    .domain(
                        [d3.min(nodes, d => Math.abs(d.data[rm])),
                        d3.max(nodes, d => Math.abs(d.data[rm]))])
                    .range([nodeScaleRanges.min, nodeScaleRanges.max]);
                    scaler(Math.abs(d.data[rm]));
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
        let node_var = info[metrics.VAR]
        let mtm = info[metrics.MTM]
        let cvar_bank = info[metrics.CVAR]
        let cvar_node = info[metrics.CVAR_NODE]
        let nr_positions = info[metrics.POSITIONS]
        let parent_info = d.srcElement.__data__.parent
        let cvar_parent = (parent_info != null) ? parent_info.data[metrics.CVAR] : node_var
        let var_parent = (parent_info != null) ? parent_info.data[metrics.VAR] : node_var
        //let var_history = info.table.VaR
        //console.log(var_history)
        //let elem = d3.select("#tooltip")
        /* elem.select('.label').html(info.name)
        elem.select('.risk_tag').html('VaR: ' +risk + ' ('+perc_risk+'%)')
        elem.select('.mtm').html('MtM: ' +mtm)
        elem.select('.nr_positions').html('Nr. of Positions: ' +nr_positions) */
        /* gauge_chart('chart_highlight',
            { 'VaR': info.risk_metric, 'History': var_history },
            { 'Negligible': [-5e6, 0],
              'Low': [-25e6, -5e6],
              'Medium': [-50e6, -25e6],
              'High': [-100e6, -50e6] }
        ) */
        //elem.style('display', "block")

        fill_node_highlight(info, node_var, mtm, nr_positions, parent_info, cvar_bank, cvar_node, var_parent, BASE_ROOT)
        
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
let btnBack2Root = document.getElementById("back2root_button");

btnExpand.onclick = expandAll;
btnCollapse.onclick = collapseAll;
btnBack2Root.onclick = back2baseroot;


// Dropdown menù per scegliere cosa visualizzare
// -------------------------------------------------------------
const toggleArrow = document.getElementById("arrow");

// Toggle dropdown function
const toggleDropdown = function () {
  dropdownMenu.classList.toggle("show");
  toggleArrow.classList.toggle("arrow");
};

/* let btnSideNavClose = document.getElementById("sidenav_close_btn");
btnSideNavClose.onclick = () => {document.getElementById("side_nav").style.display = "none"}

let btnSideNavOpen = document.getElementById("sidenav_open_btn");
btnSideNavOpen.onclick = () => {document.getElementById("side_nav").style.display = "block"}
 */
let btnTooltipClose = document.getElementById("close_tooltip_btn");
btnTooltipClose.onclick = () => {document.getElementById("tooltip").style.display = "none"}

// REF: https://www.youtube.com/watch?v=5nJwLnOfwJI, min: 5:43
let getValue = document.getElementById("browse_nodes")
console.log(
    getValue
)
getValue.addEventListener("change", (e) => {
    const option = document.querySelector(`#${e.target.list.id} option[value='${e.target.value}']`);
    let new_root = e.target.value
    console.log(i, new_root)
    console.log('current', CURRENT_ROOT)
    console.log(find_new_subTree(root, new_root))
    CURRENT_ROOT = find_new_subTree(root, new_root)
    update(CURRENT_ROOT)
})
