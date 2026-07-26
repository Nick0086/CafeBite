import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { feedbackSchema } from '../validation/feedback.schema';
import { feedbackDefaultValues } from '../constants/clientSupport.constants';

export function useFeedbackForm({ isEdit, editData, open }) {
    const form = useForm({
        resolver: zodResolver(feedbackSchema),
        defaultValues: feedbackDefaultValues,
    });

    useEffect(() => {
        if (isEdit && editData) {
            form.setValue('title', editData?.title);
            form.setValue('description', editData?.description);
            form.setValue('type', editData?.type);
        } else {
            form.reset(feedbackDefaultValues);
        }
    }, [editData, isEdit, form, open]);

    return form;
}
