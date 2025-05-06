import React, { useEffect, memo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/tremor-dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { createQrCode, updateQrCode } from '@/service/table-qrcode.service';
import { qrCodeQueryKeyLookup } from './utils';
import ReusableFormField from '@/common/Form/ReusableFormField';

// Dynamic schema based on edit mode
const getFormSchema = () => {
    return yup.object().shape({
        tableNumbers: yup.string().required('QR Code Name is required'),
        templateId: yup.string().required('Please select a template'),
    });
};

// Default values based on edit mode
const getDefaultValues = () => {
    return {
        tableNumbers: '',
        templateId: '',
    };
};

const QrCodeForm = memo(({ open, onClose, isEdit, selectedData, templateOptions, isLoadingTemplates }) => {
    const queryClient = useQueryClient();

    // Create form with dynamic schema based on isEdit
    const form = useForm({
        resolver: yupResolver(getFormSchema()),
        defaultValues: getDefaultValues()
    });

    useEffect(() => {
        if (isEdit && selectedData) {
            form.reset({
                tableNumbers: selectedData?.table_number,
                templateId: selectedData.template_id || ''
            });
        } else if (!isEdit) {
            form.reset(getDefaultValues());
        }
    }, [isEdit, selectedData, form]);

    const handleModalClose = () => {
        queryClient.invalidateQueries(qrCodeQueryKeyLookup['QRCODES']);
        form.reset(getDefaultValues());
        onClose();
    };

    const createQrCodeMutation = useMutation({
        mutationFn: createQrCode,
        onSuccess: (res) => {
            toastSuccess(res?.message || 'QR Code created successfully');
            handleModalClose();
        },
        onError: (error) => {
            toastError(`Error creating QR Code: ${error?.err?.error}`);
        }
    });

    const updateQrCodeMutation = useMutation({
        mutationFn: updateQrCode,
        onSuccess: (res) => {
            toastSuccess(res?.message || 'QR Code updated successfully');
            handleModalClose();
        },
        onError: (error) => {
            toastError(`Error updating QR Code: ${error?.err?.error}`);
        }
    });

    const handleFormSubmit = (data) => {
        if (isEdit) {
            updateQrCodeMutation.mutate({ qrCodeData: data, qrCodeId: selectedData?.unique_id });
        } else {
            createQrCodeMutation.mutate(data);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleModalClose}>
            <DialogContent className='lg:min-w-[30%] md:min-w-[40%] min-w-[95%] overflow-hidden'>
                {open && (
                    <>
                        <DialogHeader>
                            <DialogTitle>{isEdit ? 'Edit QR Code' : 'Create New QR Codes'}</DialogTitle>
                        </DialogHeader>
                        <div className='max-h-[80dvh] overflow-auto p-0'>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                                    <div className='mx-auto grid grid-cols-1 gap-4 px-4 pt-2 mb-2'>
                                        <ReusableFormField
                                            control={form.control}
                                            name="tableNumbers"
                                            required={true}
                                            label="Qr Code Name"
                                            placeholder="Enter Qr Code name"
                                            className=""
                                            disabled={updateQrCodeMutation.isPending}
                                        />


                                        <ReusableFormField
                                            control={form.control}
                                            type='select'
                                            required
                                            name='templateId'
                                            label='Template'
                                            isLoading={isLoadingTemplates}
                                            options={templateOptions}
                                            placeholder='Select a template'
                                            disabled={createQrCodeMutation.isPending || updateQrCodeMutation.isPending}
                                        />
                                    </div>
                                    <div className='flex items-center justify-start gap-2 sticky bottom-0 border-t bg-white py-2 px-4'>
                                        <Button type='submit' variant='gradient' disabled={createQrCodeMutation.isPending || updateQrCodeMutation.isPending} isLoading={createQrCodeMutation.isPending || updateQrCodeMutation.isPending}>
                                            Save Changes
                                        </Button>
                                        <Button type='button' variant='outline' color='ghost' disabled={createQrCodeMutation.isPending || updateQrCodeMutation.isPending} onClick={handleModalClose}>
                                            Cancel
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

export default QrCodeForm;