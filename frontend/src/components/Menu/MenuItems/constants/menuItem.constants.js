export const menuItemQueryKeys = {
    ALL: 'menu-item',
    IMAGE_URL: (id) => ['menu-item', 'image-url', id],
};

export const MENU_ITEM_STATUS_OPTIONS = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 },
];

export const MENU_ITEM_STOCK_OPTIONS = [
    { label: 'In Stock', value: 'in_stock' },
    { label: 'Out of Stock', value: 'out_of_stock' },
];

export const MENU_ITEM_FOOD_OPTIONS = [
    { label: 'Veg', value: 'veg' },
    { label: 'Non Veg', value: 'non_veg' },
];

export const MENU_ITEM_COLUMNS_MAPPING = {
    id: 'Sr No',
    name: 'Item Name',
    price: 'Price',
    veg_status: 'Food Type',
    category_name: 'Category',
    availability: 'Availability',
    status: 'Status',
    actions: 'Actions',
};

export const PRICE_OPERATORS = [
    { label: 'Equals', value: 'equals' },
    { label: 'Greater', value: 'greaterThan' },
    { label: 'Less', value: 'lessThan' },
];
