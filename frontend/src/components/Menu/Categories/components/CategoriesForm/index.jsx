import { FolderPlus, PencilLine } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/tremor-dialog';
import { Form } from '@/components/ui/form';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { useCategoryForm } from '../../hooks/useCategoriesForm';
import { useCreateCategoryMutation, useUpdateCategoryMutation } from '../../hooks/useCategoriesData';
import CategoryFormFields from './CategoryFormFields';
import CategoryFormFooter from './CategoryFormFooter';

const defaultValues = { name: '', status: 1 };

export default function CategoriesForm({ open, onHide, isEdit, selectedRow }) {
    const form = useCategoryForm({ isEdit, selectedRow, open });
    const createMutation = useCreateCategoryMutation();
    const updateMutation = useUpdateCategoryMutation();

    const handleModalClose = () => {
        form.reset(defaultValues);
        onHide();
    };

    const handleFormSubmit = (data) => {
        if (isEdit) {
            updateMutation.mutate(
                { categoryId: selectedRow?.unique_id, ...data },
                {
                    onSuccess: (res) => {
                        toastSuccess(res?.message || `Category ${data.name} updated successfully`);
                        handleModalClose();
                    },
                    onError: (error) => toastError(`Error updating Category: ${error?.err?.error}`),
                }
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: (res) => {
                    toastSuccess(res?.message || `Category ${data.name} added successfully`);
                    handleModalClose();
                },
                onError: (error) => toastError(`Error creating Category: ${error?.err?.error}`),
            });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog className="p-0" open={open} onOpenChange={handleModalClose}>
            <DialogContent className="w-[calc(100%-2rem)] overflow-hidden rounded-2xl border-slate-200 p-0 shadow-2xl sm:max-w-lg">
                {open && (
                    <>
                        <DialogHeader closeButton className="border-b border-slate-100 bg-slate-50/80 p-5 pr-12">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                    {isEdit ? <PencilLine className="h-5 w-5" aria-hidden="true" /> : <FolderPlus className="h-5 w-5" aria-hidden="true" />}
                                </div>
                                <div>
                                    <DialogTitle className="text-xl">{isEdit ? 'Edit category' : 'Create a category'}</DialogTitle>
                                    <p className="mt-1 text-sm font-normal text-slate-500">
                                        {isEdit ? 'Keep this section accurate for your customers.' : 'Give your menu items a clear place to belong.'}
                                    </p>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="p-5">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                                    <CategoryFormFields form={form} isEdit={isEdit} isPending={isPending} />
                                    <CategoryFormFooter onCancel={handleModalClose} isPending={isPending} />
                                </form>
                            </Form>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
