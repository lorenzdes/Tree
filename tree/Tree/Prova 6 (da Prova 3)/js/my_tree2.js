import treeData from '../data/ISP_ptf_v2.json' assert { type: 'json' };

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

let sliderFontSize = document.getElementById("sliderFontSize");

function changeFontSize() {
    console.log(sliderFontSize.value);
    n = document.getElementsByName(node);
    console.log(n);
    n.attr("font-size", "8px");
    //return ""+sliderFontSize.value +"px";
}


sliderFontSize.onchange = changeFontSize;

let sliderNodeSize = document.getElementById("sliderNodeSize");
let changeNodeSize = () => {
    nodeScaleRanges.max = sliderNodeSize.value
    update(root);
}
sliderNodeSize.onchange = changeNodeSize;

let dropdownList = document.getElementById('metrics');
let changeMetric = (ev) => {
    let selecetedIndex = dropdownList.selectedIndex;
    let selectedOption = dropdownList.options[selecetedIndex];
    /*console.log(selectedOption.text);*/
    update(root);
    risk_metric = selectedOption.text;
}
dropdownList.onchange = changeMetric;

// ***********************************************


var margin = { top: 20, right: 90, bottom: 20, left: 90 };
var width = 1850 - margin.left - margin.right;
var height = 800 - margin.top - margin.bottom;
var nodeScaleRanges = {min: 1, max:sliderNodeSize.value};
var depthScaler = 50;
var risk_metric = "VaR";

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

var treemap = d3.tree().size([height, width]);
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
    /*var tooltip = d3.select("container.svg")
                    .append("div")
                    .attr("class", "tooltip")*/
                    /*
                    .style("background-color", "white")
                    .style("border", "solid")
                    .style("border-width", "2px")
                    .style("border-radius", "5px")
                    .style("padding", "5px")
                    */

    var treeData = treemap(root);
    // nodes
    var nodes = treeData.descendants();
    let nodeScaler = d3.scaleLinear()
                    .domain(
                        [d3.min(nodes, d => d.data.abs_mtm),
                        d3.max(nodes, d => d.data.abs_mtm)])
                    .range([nodeScaleRanges.min, nodeScaleRanges.max]);
    
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
            .text(d => d.data.name)
                .clone(true).lower()
                .attr("stroke-linejoin", "round")
                .attr("stroke-width", 3)
                //.attr("font-size", "5px")
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
            .attr("r", d => nodeScaler(d.data.abs_mtm)/2 +"px")
            .style("fill", d => d._children ? "grey" : "#fff")
            /* Set the color of the circle based on +/- values */
            .style("stroke", d => node_color(d))
            .attr("cursor", "pointer");

    nodeUpdate
        .on("mouseover", mouseover)
        //.on("mousemove", d => mousemove(d))
        .on("mouseout", mouseout);

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
            .style("stroke-width", d => nodeScaler(d.data.abs_mtm) +"px")
            .style("stroke", d => link_color(d));

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

    function node_color(d, rm=risk_metric) {
        let out;
        if (rm == "Net MtM") {
            console.log(rm);
            out = d.data.mtm;
        }
        if (rm == "Gross MtM") {
            console.log(rm);
            out == d.data.abs_mtm
        }
        else {
            console.log(rm);
            out = d.data.risk_metric
        }
        return out>0 ? "green" : "red";
    }
  
    function link_color(d) {
        return d.data.risk_metric>0 ? "#e0ffcd" : "#ffebbb";
    }

    function mouseover() {
        //console.log(d)
        let elem = document.getElementById("tooltip")
        elem.style.display="block"
        elem.textContent = "Var is: 100"
        /*tooltip
            .transition()
            .duration(300)
            .style("opacity", 1)
            */
    }

    function mousemove(d) {
        console.log(d);
        //console.log(tooltip);
        tooltip
            .html("VaR is: " + "CIAO")
            .style("left", (d.x) + "px")
            .style("top", (d.y) + "px")
            .style("display", "block")
    }

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
const dropdownBtn = document.getElementById("nodecont_dropdown_btn");
const dropdownMenu = document.getElementById("dropdown");
const toggleArrow = document.getElementById("arrow");

// Toggle dropdown function
const toggleDropdown = function () {
  dropdownMenu.classList.toggle("show");
  toggleArrow.classList.toggle("arrow");
};

// Toggle dropdown open/close when dropdown button is clicked
dropdownBtn.addEventListener("click", function (e) {
  e.stopPropagation();
  toggleDropdown();
});

// Close dropdown when dom element is clicked
document.documentElement.addEventListener("click", function () {
  if (dropdownMenu.classList.contains("show")) {
    toggleDropdown();
  }
});


// DA TOGLIERE
function metric(d) {
    var value = d.options[d.selectedIndex].value;
    console.log(value);
}

//console.log(dropdownMenu)


var selectElement = document.querySelector('#metrics');
var output = selectElement.value;
//console.log(output)

function metricDropDownOnChange(dropdownList) {
    let selecetedIndex = dropdownList.selectedIndex;
    let selectedOption = dropdownList.options[selecetedIndex];
    console.log("Selected value is: " + selectedOption.text);
}

/*
let dropdownList = document.getElementById('metrics');
    dropdownList.onchange = (ev) =>{
        let selecetedIndex = dropdownList.selectedIndex;
        let selectedOption = dropdownList.options[selecetedIndex];
        console.log("Selected value is: " + selectedOption.text);
    }
*/