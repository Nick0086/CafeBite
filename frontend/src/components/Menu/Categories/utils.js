export const getStatusOptions = () => [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 },
];

export const queryKeyLoopUp = {
    'Category': 'menu-catgeory'
}

export const getCatgeoryColumnsMapping = () => ({
    id: 'Sr No',
    name: 'Category',
    menu_item_count: 'Count',
    status: 'Status',
    actions: 'Actions',
});
