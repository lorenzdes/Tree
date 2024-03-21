export const metrics = {
    VAR: 'stand_alone_var',
    MTM: 'MTM_RW',
    GROSS_MTM: 'ABS_MTM_RW',
    POSITIONS: 'N_POS',
    CVAR: 'CVaR_Banca',
    CVAR_NODE: 'CVaR_tree'
}

export const metrics_map = {
    'Select node color by:': metrics.VAR,
    'VaR': metrics.VAR,
    'Net MtM': metrics.MTM,
    'Gross MtM': metrics.GROSS_MTM,
    'Nr. of Positions': metrics.POSITIONS,
    'CVaR': metrics.CVAR,
    '(S)VaR': metrics.VAR,
    'C(S)VaR': metrics.CVAR
}

export const tree_parameters = {
    'NODE_COLOR': metrics.VAR,
    'PATH_CPLOR': metrics.VAR,
    'SIZE_METRIC': metrics.GROSS_MTM
}

export const look_in = {
    'NODE': "node", 
    'RES': "results"
}

export const data_positions = {
    'name': look_in.NODE,
    'stand_alone_var': look_in.NODE,
    'N_pos': look_in.NODE,
    'MTM_RW': look_in.NODE,
    'MTM_FO': look_in.NODE,
    'ABS_MTM_RW': look_in.NODE,
    'ABS_MTM_FO': look_in.NODE,
    'ABS_MTM_DIFF': look_in.NODE,
    'results': look_in.RES,
    'aggregation_level': look_in.NODE,
    'list others': look_in.NODE,
    'children': look_in.NODE,
    'CVaR_Banca': look_in.NODE
}

export const datasets = {
    VAR: 'Tree_mod_cvartree3.json',
    SVAR: 'Tree_mod_SVAR_cvartree3.json' 
}