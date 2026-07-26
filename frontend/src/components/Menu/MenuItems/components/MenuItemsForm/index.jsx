import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/tremor-dialog';
import { Form } from '@/components/ui/form';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { useMenuItemForm } from '../../hooks/useMenuItemsForm';
import { useCreateMenuItemMutation, useUpdateMenuItemMutation } from '../../hooks/useMenuItemsData';
import MenuItemFormFields from './MenuItemFormFields';
import MenuItemFormFooter from './MenuItemFormFooter';

export default function MenuItemForm({ open, onHide, isEdit, selectedRow, isDirect }) {
    const form = useMenuItemForm({ isEdit, selectedRow, isDirect, open });
    const createMutation = useCreateMenuItemMutation();
    const updateMutation = useUpdateMenuItemMutation();

    const handleModalClose = () => {
        form.reset();
        onHide();
    };

    const handleFormSubmit = (data) => {
        const formData = new FormData();
        for (const [key, value] of Object.entries(data)) {
            if (value !== null && value !== undefined && value !== '') {
                formData.append(key, value);
            }
        }

        if (isEdit && !isDirect) {
            updateMutation.mutate(
                { menuData: formData, menuItemId: selectedRow?.unique_id },
                {
                    onSuccess: (res) => {
                        toastSuccess(res?.message || `Menu Item ${data.name} updated successfully`);
                        handleModalClose();
                    },
                    onError: (error) => toastError(`Error updating Menu Item: ${error?.err?.error}`),
                }
            );
        } else {
            createMutation.mutate(formData, {
                onSuccess: (res) => {
                    toastSuccess(res?.message || `Menu Item ${data.name} added successfully`);
                    handleModalClose();
                },
                onError: (error) => toastError(`Error adding Menu Item: ${error?.err?.error}`),
            });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={handleModalClose}>
            <DialogContent className="min-w-[40%]">
                {open && (
                    <>
                        <DialogHeader>
                            <DialogTitle>{isEdit ? 'Edit Menu Item' : 'Create New Menu Item'}</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[80dvh] overflow-auto p-0">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                                    <MenuItemFormFields form={form} isDirect={isDirect} isPending={isPending} selectedRow={selectedRow} />
                                    <MenuItemFormFooter onCancel={handleModalClose} isPending={isPending} />
                                </form>
                            </Form>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
