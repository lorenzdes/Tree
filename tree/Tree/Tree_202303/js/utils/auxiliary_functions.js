// ***********************************************
// TREE OPERATIONS
// ***********************************************
export function find_new_subTree(old_root, new_root_name) {
    let temp = old_root.find(d => d.data.name==new_root_name)
    let new_root = temp.copy()
    new_root.x = temp.x
    new_root.x0 = temp.x0
    new_root.y = temp.y
    new_root.y0 = temp.y0
    //console.log('found:', new_root)
    return new_root//old_root.find(d => d.data.name==new_root_name).copy()
}


// ***********************************************
// Ref: http://jsfiddle.net/z9tmgp

export function expand(d){   
    var children = (d.children)?d.children:d._children;
    if (d._children) {        
        d.children = d._children;
        d._children = null;       
    }
    if(children)
      children.forEach(expand);
}


export function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
}


export function get_cvar_other(d) {
    let others;
    let cvar_rescaled;
    //console.log('qui: '+d.depth)
    // If we are on the root level, 
    if (d.depth === 0) {
        cvar_rescaled = d.data['stand_alone_var']
    }
    else {
        others = d.parent.data['list others']
        if (others.includes(d.data.name)) {
            let other_cvar;
            if (d.depth === 1) {
                other_cvar = d.parent.data.results.results_250['Other_'+d.parent.data.name]['stand_alone_var']
                //console.log(d.data.name, other_cvar)
            } else {
                //console.log(d.data.name)
                other_cvar = d.parent.data.results.results_250['Other_'+d.parent.data.name]['CVaR']
                //console.log(other_cvar)
            }
            let childs_other_var = {}
            d.parent.children.forEach(c => {
                if (others.includes(c.data.name)) {
                    childs_other_var[c.data.name] = c.data['stand_alone_var']
                }
            })
            cvar_rescaled = other_cvar*childs_other_var[d.data.name]/Object.values(childs_other_var).reduce((a, b) => a + b, 0)
            //console.log(d.data.name, cvar_rescaled)
        } else {
            console.log(d.data.name, d)
            cvar_rescaled = d.parent.data.results.results_250[d.data.name]['CVaR']
            console.log(d.parent.data.results.results_250[d.data.name]['CVaR'])
        }
    }
    return cvar_rescaled
}


// ***********************************************
// FORMATTING
// ***********************************************
export function format_numbers(data, typ) {
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


// Change the FONT SIZE **************************************
/* let sliderFontSize = document.getElementById("sliderFontSize");
let changeFontSize = () => {
    fontSize = +sliderFontSize.value+"px";
    update(root);
}
sliderFontSize.onchange = changeFontSize; */

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

// Select the dataset between VaR and SVaR
/* import { datasets } from "./namespace"


let dropdownRiskMeasure = document.getElementById('dropdown_attribution');
console.log(dropdownRiskMeasure)
export let dataset = datasets.VAR
let changeDataset = () => {
    let selecetedIndex = dropdownRiskMeasure.selectedIndex;
    let selectedOption = dropdownRiskMeasure.options[selecetedIndex];
    console.log('prima:' +dataset)
    dataset = datasets[selectedOption.text];
    console.log('dopo:' +dataset)
}
dropdownRiskMeasure.onchange = changeDataset; */