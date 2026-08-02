import { useState } from 'react';
import { PencilLine, UtensilsCrossed } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/tremor-dialog';
import { Form } from '@/components/ui/form';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { useMenuItemForm } from '../../hooks/useMenuItemsForm';
import { useCreateMenuItemMutation, useUpdateMenuItemMutation } from '../../hooks/useMenuItemsData';
import MenuItemFormFields from './MenuItemFormFields';
import MenuItemFormFooter from './MenuItemFormFooter';
import { getUploadUrl } from '@/service/menuItems.service';
import { processImageToWebp } from '@/lib/imageProcessor';

export default function MenuItemForm({ open, onHide, isEdit, selectedRow, isDirect }) {
    const form = useMenuItemForm({ isEdit, selectedRow, isDirect, open });
    const createMutation = useCreateMenuItemMutation();
    const updateMutation = useUpdateMenuItemMutation();
    const [isUploading, setIsUploading] = useState(false);

    const handleModalClose = () => {
        form.reset();
        onHide();
    };

    const uploadImage = async (file) => {
        const { uploadUrl, key } = await getUploadUrl();
        const processedBlob = await processImageToWebp(file);
        const res = await fetch(uploadUrl, { method: 'PUT', body: processedBlob, headers: { 'Content-Type': 'image/webp' } });
        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
        const timestamp = Date.now();
        return {
            fileName: file.name,
            public_id: `upload_${timestamp}_${file.name}`,
            fileMimeType: 'image/webp',
            path: key,
        };
    };

    const handleFormSubmit = async (data) => {
        const coverFile = data.cover_image;

        let imageDetails = null;
        if (coverFile instanceof File) {
            setIsUploading(true);
            try {
                imageDetails = await uploadImage(coverFile);
            } catch {
                toastError('Failed to upload image. Please try again.');
                return;
            } finally {
                setIsUploading(false);
            }
        }

        const payload = {
            category_id: data.category_id,
            name: data.name,
            description: data.description,
            price: data.price,
            availability: data.availability,
            veg_status: data.veg_status,
            image_details: imageDetails,
        };

        if (isEdit && !isDirect) {
            updateMutation.mutate(
                { menuItemId: selectedRow?.unique_id, ...payload },
                {
                    onSuccess: (res) => {
                        toastSuccess(res?.message || `Menu Item ${data.name} updated successfully`);
                        handleModalClose();
                    },
                    onError: (error) => toastError(`Error updating Menu Item: ${error?.err?.error || error?.message}`),
                }
            );
        } else {
            createMutation.mutate(payload, {
                onSuccess: (res) => {
                    toastSuccess(res?.message || `Menu Item ${data.name} added successfully`);
                    handleModalClose();
                },
                onError: (error) => toastError(`Error adding Menu Item: ${error?.err?.error}`),
            });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending || isUploading;

    return (
        <Dialog className="p-0" open={open} onOpenChange={handleModalClose}>
            <DialogContent className="w-[calc(100%-2rem)] overflow-hidden rounded-2xl border-slate-200 p-0 shadow-2xl sm:max-w-3xl">
                {open && (
                    <>
                        <DialogHeader closeButton className="border-b border-slate-100 bg-slate-50/80 p-4 pb-2 pr-12">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                    {isEdit ? <PencilLine className="h-5 w-5" aria-hidden="true" /> : <UtensilsCrossed className="h-5 w-5" aria-hidden="true" />}
                                </div>
                                <div>
                                    <DialogTitle className="text-xl">{isEdit ? 'Edit menu item' : 'Create a menu item'}</DialogTitle>
                                    <p className="mt-1 text-sm font-normal text-slate-500">
                                        {isEdit ? 'Keep your menu looking fresh and up to date.' : 'Add a dish with name, price, category, and a photo.'}
                                    </p>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className=" pb-0">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-2">
                                    <MenuItemFormFields form={form} isEdit={isEdit} isDirect={isDirect} isPending={isPending} selectedRow={selectedRow} />
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
