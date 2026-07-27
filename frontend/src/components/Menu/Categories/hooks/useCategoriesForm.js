import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema } from '../validation/category.schema';

const defaultValues = { name: '', status: 1 };

export function useCategoryForm({ isEdit, selectedRow, open }) {
    const form = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues,
    });

    useEffect(() => {
        if (isEdit && selectedRow) {
            form.reset({
                name: selectedRow?.name || '',
                status: selectedRow?.status !== undefined && selectedRow?.status !== null ? Number(selectedRow?.status) : 1,
            });
        } else if (open) {
            form.reset(defaultValues);
        }
    }, [isEdit, selectedRow, form, open]);

    return form;
}
