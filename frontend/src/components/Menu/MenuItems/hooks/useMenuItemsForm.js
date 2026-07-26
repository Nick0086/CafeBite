import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { menuItemSchema } from '../validation/menuItem.schema';

const defaultValues = {
    name: '',
    description: '',
    price: '',
    cover_image: '',
    category_id: null,
    availability: 'in_stock',
    veg_status: 'veg',
    status: 1,
};

export function useMenuItemForm({ isEdit, selectedRow, isDirect, open }) {
    const form = useForm({
        resolver: zodResolver(menuItemSchema),
        defaultValues,
    });

    useEffect(() => {
        if ((isEdit && selectedRow) || isDirect) {
            form.reset({
                name: selectedRow?.name || '',
                description: selectedRow?.description || '',
                price: selectedRow?.price != null ? parseFloat(selectedRow.price) : null,
                cover_image: selectedRow?.cover_image || null,
                category_id: selectedRow?.category_id || null,
                availability: selectedRow?.availability || null,
                veg_status: selectedRow?.veg_status || 'veg',
                status: Number(selectedRow?.status ?? 1),
            });
        } else if (open) {
            form.reset(defaultValues);
        }
    }, [isEdit, selectedRow, isDirect, form, open]);

    return form;
}
