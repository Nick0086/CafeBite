import React, { useEffect, memo, useMemo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/tremor-dialog';
import { Form } from '@/components/ui/form';
import ReusableFormField from '@/common/Form/ReusableFormField';
import { Button } from '@/components/ui/button';
import { getFoodOptions, menuQueryKeyLoopUp, getStatusOptions, getStockOptions } from './utils';
import { queryKeyLoopUp } from '../Categories/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import ImageAvatar from '@/components/ui/ImageAvatar';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { createMenuItem, updateMenuItem } from '@/service/menuItems.service';
import { getAllCategory } from '@/service/categories.service';
import { useTranslation } from 'react-i18next';

// Validation Schema
const formSchema = (t) => {
    return yup.object().shape({
        name: yup.string().required(t('menu_item_name_required')),
        description: yup.string().required(t('menu_item_description_required')),
        category_id: yup.string().required(t('menu_item_category_required')),
        price: yup.number().typeError(t('menu_item_price_number')).required(t('menu_item_price_required')),
    })
};

// Default Values
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

const MenuItemForm = memo(({ open, onHide, isEdit, selectedRow, isDireact }) => {

    const {t} = useTranslation()
    const queryClient = useQueryClient();
    const [imageWarning, setImageWarning] = useState(true);

    const form = useForm({
        resolver: yupResolver(formSchema(t)),
        defaultValues,
    });

    const menuItemName = form.watch('name')

    // Populate form fields when editing an existing item
    useEffect(() => {
        if ((isEdit && selectedRow) || isDireact) {
            if (isDireact) {
                setImageWarning(true)
            }
            form.reset({
                name: selectedRow.name || '',
                description: selectedRow.description || '',
                price: parseFloat(selectedRow.price) || null,
                cover_image: selectedRow.cover_image || null,
                category_id: selectedRow.category_id || null,
                availability: selectedRow.availability || null,
                veg_status: selectedRow.veg_status || 'veg',
                status: selectedRow.status?.toString() || '1',
            });
        } else {
            setImageWarning(true)
            form.reset(defaultValues);
        }
    }, [isEdit, selectedRow, form]);

    // Handle image upload
    const handleImageUpload = (image) => {
        setImageWarning(false)
        form.setValue('cover_image', image);
    };

    // Handle image deletion
    const handleDeleteImage = () => {
        setImageWarning(true)
        form.setValue('cover_image', selectedRow?.cover_image || null);
    };

    // Fetch categories
    const { data: categoryData, isLoading: categoryIsLoading, error: categoryError } = useQuery({
        queryKey: [queryKeyLoopUp['Category']],
        queryFn: getAllCategory,
    });

    // Handle category fetch errors
    useEffect(() => {
        if (categoryError) {
            toast.error(`${t("error_fetching_category")}: ${JSON.stringify(categoryError)}`);
        }
    }, [categoryError]);

    // Generate category options
    const categoryOptions = useMemo(() => {
        if (categoryData) {
            const categories = categoryData?.categories || [];
            return categories.map((category) => ({
                value: category?.unique_id,
                label: category?.name,
            }));
        }
        return [];
    }, [categoryData]);

    // Close modal and reset form
    const handleModalClose = () => {
        form.reset(defaultValues);
        onHide();
    };

    const createMenuItemMutation = useMutation({
        mutationFn: createMenuItem,
        onSuccess: (res) => {
            queryClient.invalidateQueries(menuQueryKeyLoopUp['item']);
            toastSuccess(res?.message || `${t("menu_items")} : ${menuItemName} ${t("created_success")}`);
            handleModalClose();
        },
        onError: (error) => {
            toastError(`${t("error_creating")} ${t("menu_items")}: ${error?.err?.error}`);
        }
    });
    const updateMenuItemMutation = useMutation({
        mutationFn: updateMenuItem,
        onSuccess: (res) => {
            queryClient.invalidateQueries(menuQueryKeyLoopUp['item']);
            toastSuccess(res?.message || `${t("menu_items")} : ${categoryName} ${t("updated_success")}`);
            handleModalClose();
        },
        onError: (error) => {
            toastError(`${t("error_updating")} ${t("menu_items")}: ${error?.err?.error}`);
        }
    });

    // Handle form submission
    const handleFormSubmit = (data) => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            formData.append(key, data[key]);
        });
        if (isEdit && !isDireact) {
            updateMenuItemMutation.mutate({ menuData: formData, menuItemId: selectedRow?.unique_id })
        } else {
            createMenuItemMutation.mutate(formData)
        }
    };
    return (
        <Dialog open={open} onOpenChange={handleModalClose}>
            <DialogContent className='min-w-[40%]' >
                {open && (
                    <>
                        <DialogHeader>
                            <DialogTitle>{isEdit ? `${t("edit")} ${t("menu_items")}` : `${t("create_new")} ${t("menu_items")}`}</DialogTitle>
                        </DialogHeader>
                        <div className='max-h-[80dvh] overflow-auto p-0' >
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleFormSubmit)} >
                                    <div className="mx-auto grid grid-cols-12 gap-4 px-4 pt-2 mb-2" >
                                        {/* Item Name */}
                                        <ReusableFormField
                                            control={form.control}
                                            name="name"
                                            required={true}
                                            label={t("item_name")}
                                            placeholder={t("menu_item_name_placeholder")}
                                            className="col-span-12 "
                                            disabled={createMenuItemMutation?.isPending || updateMenuItemMutation?.isPending}
                                        />

                                        {/* Description */}
                                        <ReusableFormField
                                            type="textarea"
                                            control={form.control}
                                            name="description"
                                            textAreaClassName="h-28"
                                            required={true}
                                            label={t("description")}
                                            placeholder={t("menu_item_description_placeholder")}
                                            className="col-span-12"
                                            disabled={createMenuItemMutation?.isPending || updateMenuItemMutation?.isPending}
                                        />


                                        {/* Category */}
                                        <ReusableFormField
                                            control={form.control}
                                            type="select"
                                            required={true}
                                            name="category_id"
                                            label={t("category")}
                                            isLoading={categoryIsLoading}
                                            options={categoryOptions}
                                            placeholder={t("menu_item_category_placeholder")}
                                            className="md:col-span-6 col-span-12"
                                            disabled={createMenuItemMutation?.isPending || updateMenuItemMutation?.isPending || isDireact}
                                        />

                                        {/* Price */}
                                        <ReusableFormField
                                            control={form.control}
                                            name="price"
                                            required={true}
                                            label={t("price")}
                                            placeholder={t("menu_item_price_placeholder")}
                                            className="md:col-span-6 col-span-12"
                                            disabled={createMenuItemMutation?.isPending || updateMenuItemMutation?.isPending}
                                        />

                                        <ReusableFormField
                                            control={form.control}
                                            type="select"
                                            required={true}
                                            name="veg_status"
                                            label={t("food_type")}
                                            options={getFoodOptions(t)}
                                            placeholder={t("menu_item_food_type_placeholder")}
                                            className="md:col-span-6 col-span-12"
                                            disabled={createMenuItemMutation?.isPending || updateMenuItemMutation?.isPending}
                                        />

                                        {/* Availability */}
                                        <ReusableFormField
                                            control={form.control}
                                            type="select"
                                            required={true}
                                            name="availability"
                                            label={t("availability")}
                                            options={getStockOptions(t)}
                                            placeholder={t("menu_item_availability_placeholder")}
                                            className="md:col-span-6 col-span-12"
                                            disabled={createMenuItemMutation?.isPending || updateMenuItemMutation?.isPending}
                                        />

                                        {/* Status (only visible in edit mode) */}
                                        {isEdit && (
                                            <ReusableFormField
                                                control={form.control}
                                                type="select"
                                                name="status"
                                                label={t("status")}
                                                options={getStatusOptions(t)}
                                                placeholder={t("menu_item_status_placeholder")}
                                                className="col-span-12 md:col-span-6"
                                                disabled={createMenuItemMutation?.isPending || updateMenuItemMutation?.isPending}
                                            />
                                        )}

                                        <div className="col-span-12  ">
                                            <label className="block text-sm font-medium mb-2">{t("cover_image")}</label>
                                            <ImageAvatar
                                                s3ImageUrl={selectedRow?.image_details?.url || ''} // Original S3 URL
                                                onImageUpload={handleImageUpload} // Handle image upload
                                                onDeleteImage={handleDeleteImage} // Handle image deletion
                                            />
                                            {
                                                imageWarning && (
                                                    <p className="text-orange-500 text-sm mt-2">
                                                        {t("cover_image_warning")}
                                                    </p>
                                                )
                                            }
                                        </div>
                                    </div>


                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-start gap-2 sticky bottom-0 border-t bg-white py-2 px-4">
                                        <Button type="submit" variant="gradient" disabled={createMenuItemMutation?.isPending || updateMenuItemMutation?.isPending} isLoading={createMenuItemMutation?.isPending || updateMenuItemMutation?.isPending}>
                                            {t("submit")}
                                        </Button>
                                        <Button type="button" variant="outline" color="ghost" disabled={createMenuItemMutation?.isPending || updateMenuItemMutation?.isPending} onClick={handleModalClose}>
                                            {t("cancel")}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
});

export default MenuItemForm;