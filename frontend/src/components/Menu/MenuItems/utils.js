export const getStatusOptions = (t) => [
    { label: t('active'), value: 1 },
    { label: t('inactive'), value: 0 },
];

export const getStockOptions = (t) => [
    { label: t('In_Stock'), value: 'in_stock' },
    { label: t('Out_of_Stock'), value: 'out_of_stock' },
];

export const getFoodOptions = (t) => [
    { label: t('veg'), value: 'veg' },
    { label: t('non_veg'), value: 'non_veg' },
];

export const  menuQueryKeyLoopUp = {
    'item' : 'menu-item'
}