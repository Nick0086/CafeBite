import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getMenuItemSchema } from '../validation/menuItem.schema';

const defaultValues = {
    name: '',
    description: '',
    price: '',
    cover_image: null,
    category_id: null,
    availability: 'in_stock',
    veg_status: '',
    status: 1,
};

export function useMenuItemForm({ isEdit, selectedRow, isDirect, open }) {
    const schema = getMenuItemSchema({ isEdit });
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues,
    });

    useEffect(() => {
        if ((isEdit && selectedRow) || isDirect) {
            form.reset({
                name: selectedRow?.name || '',
                description: selectedRow?.description || '',
                price: selectedRow?.price != null ? parseFloat(selectedRow.price) : null,
                cover_image: null,
                category_id: selectedRow?.category_id || null,
                availability: selectedRow?.availability || null,
                veg_status: selectedRow?.veg_status || '',
                status: Number(selectedRow?.status ?? 1),
            });
        } else if (open) {
            form.reset(defaultValues);
        }
    }, [isEdit, selectedRow, isDirect, form, open]);

    return form;
}
