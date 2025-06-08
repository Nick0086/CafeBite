import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/tremor-dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import ReusableFormField from '@/common/Form/ReusableFormField';
import { queryKeyLoopUp, getStatusOptions } from './utils';
import { createCategory, updateCategory } from '@/service/categories.service';
import { useTranslation } from 'react-i18next';

const getFormSchema = (t) =>{
    return yup.object().shape({
        name: yup.string().required(t('category_required')),
        status: yup.number().notRequired(),
    });
}

const defaultValues = {
    name: "",
    status: 1,
};

export default function CategoriesForm({ open, onHide, isEdit, selectedRow }) {

    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const statusOptions = getStatusOptions(t);
    const form = useForm({
        resolver: yupResolver(getFormSchema(t)),
        defaultValues: defaultValues,
    });

    const categoryName = form.watch('name')

    useEffect(() => {
        if (isEdit) {
            form.setValue("name", selectedRow?.name);
            form.setValue("status", selectedRow?.status?.toString());
        }
    }, [selectedRow, form]);

    const handleModalClose = () => {
        form.reset(defaultValues);
        onHide();
    }

    const createCategoryMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: (res) => {
            queryClient.invalidateQueries(queryKeyLoopUp['Category']);
            toastSuccess(res?.message || `${t('category')} ${categoryName} ${t('created_success')}`);
            handleModalClose();
        },
        onError: (error) => {
            toastError(`${'error_creating'} ${t('category')}: ${error?.err?.error}`);
        }
    });

    const updateCategoryMutation = useMutation({
        mutationFn: updateCategory,
        onSuccess: (res) => {
            queryClient.invalidateQueries(queryKeyLoopUp['Category']);
            toastSuccess(res?.message || `${t('category')} ${categoryName} ${t('updated_success')}`);
            handleModalClose();
        },
        onError: (error) => {
            toastError(`${'error_updating'} ${t('category')}: ${error?.err?.error}`);
        }
    });

    const handleFormSubmit = (data) => {
        if (isEdit) {
            updateCategoryMutation.mutate({ categoryId: selectedRow?.unique_id, ...data });
        } else {
            createCategoryMutation.mutate(data);
        }
    }

    return (
        <Dialog className='p-0' open={open} onOpenChange={handleModalClose} >
            <DialogContent className='w-[95%]'  style={{ fontFamily: 'Nunito, "Segoe UI", arial' }}>
                {
                    open && (
                        <>
                            <DialogHeader closeButton className={'p-3 py-2'} >
                                <DialogTitle>{isEdit ? t('edit_category') : t('create_category')}</DialogTitle>
                            </DialogHeader>

                            <DialogDescription className='py-2' >
                                <div >
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className=" space-y-4 mx-auto">

                                            <ReusableFormField control={form.control} name='name' required={true} label={t('category_name')}  placeholder={t('add_category')} />

                                            {
                                                isEdit && (
                                                    <ReusableFormField control={form.control} type='select' name='status'  label={t('status')} options={statusOptions} />
                                                )
                                            }

                                            <div className='flex items-center gap-4 py-2'>
                                                <Button type="submit" variant="gradient" disabled={createCategoryMutation?.isPending || updateCategoryMutation?.isPending} isLoading={createCategoryMutation?.isPending || updateCategoryMutation?.isPending}>
                                                    {t('Submit')}
                                                </Button>
                                                <Button type="button" variant="outline" color="ghost" className={`cursor-pointer`} onClick={handleModalClose}>{t('cancel')}</Button>
                                            </div>
                                        </form>
                                    </Form>
                                </div>
                            </DialogDescription>
                        </>
                    )
                }
            </DialogContent>
        </Dialog>
    )
}
