import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/tremor-dialog';
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
            <DialogContent className="w-[95%]" style={{ fontFamily: 'Nunito, "Segoe UI", arial' }}>
                {open && (
                    <>
                        <DialogHeader closeButton className="p-3 py-2">
                            <DialogTitle>{isEdit ? 'Edit Category' : 'Create Category'}</DialogTitle>
                        </DialogHeader>
                        <DialogDescription className="py-2">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                                    <CategoryFormFields form={form} isEdit={isEdit} isPending={isPending} />
                                    <CategoryFormFooter onCancel={handleModalClose} isPending={isPending} />
                                </form>
                            </Form>
                        </DialogDescription>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
