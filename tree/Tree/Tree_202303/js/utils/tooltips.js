import {
    format_numbers
} from './auxiliary_functions.js'

import { metrics } from './namespace.js'

export function fill_node_highlight(info, node_var, mtm, nr_positions, parent_info, cvar, cvar_node, cvar_parent, base) {
    let highlight = d3.select("#node_highlight")
    let parent_name = parent_info != null ? parent_info.data.name : '-'
    let bank_var = base.data[metrics.VAR]
    let level = info.aggregation_level === undefined ? 'PORTFOLIO' : info.aggregation_level
    //console.log(info)
    highlight.select(".node_name").html(info.name)
    highlight.select(".node_level").html('Level: ' +level)
    highlight.select(".node_mtm").html('MtM: ' +format_numbers(mtm, 'CCY'))
    highlight.select(".node_var").html('(S)VaR: \n' +format_numbers(node_var, 'CCY'))
    highlight.select(".node_varmtm").html('(S)VaR/MtM: '+Math.abs(node_var/mtm*100).toFixed(1)+'%')
    highlight.select(".node_cvar")
        .html('C(S)VaR Parent: \n' +format_numbers(cvar_node, 'CCY') + ' ('+(cvar_node/cvar_parent*100).toFixed(1)+'%)')
    highlight.select(".bank_cvar")
        .html('C(S)VaR Bank: \n' +format_numbers(cvar, 'CCY') + ' ('+(cvar/bank_var*100).toFixed(1)+'%)')
    //highlight.select(".node_cvaronvar").html('%CVaR: \n' +Math.abs(cvar/cvar_parent*100).toFixed(1)+'%')
    highlight.select(".node_nr_positions").html('Nr. of Positions: ' +format_numbers(nr_positions, 'NUM'))
    highlight.select(".node_parent").html('Parent: '+ parent_name)
    //highlight.select(".node_parent").innerHTML = 'Parent: ' + parent_name
    if (info.name === 'BANCA IMI') {
        console.log('Node VaR: ' + node_var, 'Parent VaR: ' + cvar_parent, 'CVaR node: ' + cvar_node)
    }
}


export function fill_root(root) {
    let highlight = d3.select("#node_highlight")
    let bank_mtm = root.data[metrics.MTM]
    let bank_var = root.data[metrics.VAR]
    highlight.select(".bank_mtm").html('MtM: ' +format_numbers(bank_mtm, 'CCY'))
    highlight.select(".bank_var").html('(S)VaR: ' +format_numbers(bank_var, 'CCY'))
    highlight.select(".bank_varmtm").html('(S)VaR/MtM: '+Math.abs(bank_var/bank_mtm*100).toFixed(1)+'%')
}