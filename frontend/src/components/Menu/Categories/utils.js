export const getStatusOptions = (t) => [
    { label: t('active'), value: 1 },
    { label: t('inactive'), value: 0 },
];

export const queryKeyLoopUp = {
    'Category': 'menu-catgeory'
}

export const getCatgeoryColumnsMapping = (t) => ({
    id: t('unique_no'),
    name: t('category'),
    menu_item_count: t('count'),
    status: t('status'),
    actions: t('actions'),
});