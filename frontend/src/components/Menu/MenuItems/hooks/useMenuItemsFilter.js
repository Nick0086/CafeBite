import { useMemo, useState } from 'react';

export function useMenuItemsFilter() {
    const [search, setSearch] = useState('');
    const [statuses, setStatuses] = useState([]);
    const [foodTypes, setFoodTypes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [price, setPrice] = useState(null);

    const reset = () => {
        setSearch('');
        setStatuses([]);
        setFoodTypes([]);
        setCategories([]);
        setAvailability([]);
        setPrice(null);
    };

    const hasAnyFilter =
        !!search ||
        statuses.length > 0 ||
        foodTypes.length > 0 ||
        categories.length > 0 ||
        availability.length > 0 ||
        !!price;

    const filterItems = useMemo(
        () => (items) =>
            items.filter((item) => {
                const q = search.trim().toLowerCase();
                if (q && !item?.name?.toLowerCase().includes(q)) return false;
                if (statuses.length > 0 && !statuses.includes(item.status)) return false;
                if (foodTypes.length > 0 && !foodTypes.includes(item.veg_status)) return false;
                if (categories.length > 0 && !categories.includes(item.category_name)) return false;
                if (availability.length > 0 && !availability.includes(item.availability)) return false;
                if (price) {
                    const v = parseFloat(item?.price);
                    if (Number.isNaN(v)) return false;
                    if (price.operator === 'lessThan' && !(v < price.value)) return false;
                    if (price.operator === 'greaterThan' && !(v > price.value)) return false;
                    if (price.operator === 'equals' && v !== price.value) return false;
                }
                return true;
            }),
        [search, statuses, foodTypes, categories, availability, price]
    );

    return {
        search,
        setSearch,
        statuses,
        setStatuses,
        foodTypes,
        setFoodTypes,
        categories,
        setCategories,
        availability,
        setAvailability,
        price,
        setPrice,
        reset,
        hasAnyFilter,
        filterItems,
    };
}
