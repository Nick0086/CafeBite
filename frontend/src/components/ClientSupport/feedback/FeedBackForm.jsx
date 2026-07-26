import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/tremor-dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ReusableFormField } from '@/common/Form/ReusableFormField';
import FileUploadArea from './components/FileUploadArea';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { createFeedback, updateFeedback } from '@/service/clientFeedback.service';
import { useFeedbackForm } from '../hooks/useFeedbackForm';
import { FEEDBACK_TYPES, feedbackQueryKeys, feedbackDefaultValues } from '../constants/clientSupport.constants';

export default function FeedbackForm({ isOpen, onClose, isEdit, editData }) {
    const [files, setFiles] = useState([]);
    const queryClient = useQueryClient();
    const form = useFeedbackForm({ isEdit, editData, open: isOpen });
    const wasOpenRef = useRef(false);

    useEffect(() => {
        if (isOpen && !wasOpenRef.current) {
            setFiles([]);
        }
        wasOpenRef.current = isOpen;
    }, [isOpen]);

    const handleModalClose = () => {
        form.reset(feedbackDefaultValues);
        setFiles([]);
        onClose();
    };

    const submitFeedbackMutation = useMutation({
        mutationFn: isEdit ? updateFeedback : createFeedback,
        onSuccess: (res) => {
            toastSuccess(res?.message || 'Ticket submitted successfully!');
            queryClient.invalidateQueries({ queryKey: [feedbackQueryKeys.LIST] });
            handleModalClose();
        },
        onError: (error) => {
            toastError(error?.err?.message || 'Failed to submit Ticket');
        },
    });

    const handleFormSubmit = (data) => {
        const formData = new FormData();
        formData.append('type', data.type);
        formData.append('title', data.title.trim());
        formData.append('description', data.description.trim());
        files.forEach((fileItem) => formData.append('images', fileItem.file));

        if (isEdit) {
            submitFeedbackMutation.mutate({ feedbackId: editData?.unique_id, data: formData });
        } else {
            submitFeedbackMutation.mutate(formData);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleModalClose} className="">
            <DialogContent stopOutsideClick={true} className="min-w-[40%] overflow-hidden">
                {isOpen && (
                    <>
                        <DialogHeader className="py-2">
                            <DialogTitle>{isEdit ? 'Edit Ticket' : 'Add Ticket'}</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[80dvh] overflow-auto p-0">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                                    <div className="mx-auto grid grid-cols-1 gap-4 px-4 pt-2 mb-2">
                                        <ReusableFormField
                                            control={form.control}
                                            disabled={submitFeedbackMutation.isPending}
                                            name="title"
                                            label="Title"
                                            type="text"
                                            placeholder="Brief title for your Ticket"
                                            required
                                        />
                                        <ReusableFormField
                                            control={form.control}
                                            disabled={submitFeedbackMutation.isPending}
                                            name="description"
                                            label="Description"
                                            type="textarea"
                                            placeholder="Detailed description of your Ticket..."
                                            required
                                            textAreaClassName="min-h-[120px]"
                                        />
                                        <ReusableFormField
                                            control={form.control}
                                            name="type"
                                            label="Ticket Type"
                                            type="singleSelect"
                                            disabled={submitFeedbackMutation.isPending}
                                            options={FEEDBACK_TYPES}
                                            placeholder="Select Ticket type"
                                            required
                                        />
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-secondary">
                                                Attachments (Optional)
                                                <p className="text-xs text-gray-500">
                                                    Add screenshots or documents to support your Ticket
                                                </p>
                                            </label>
                                            <FileUploadArea
                                                files={files}
                                                setFiles={setFiles}
                                                disabled={submitFeedbackMutation.isPending}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-start gap-2 sticky bottom-0 border-t bg-white py-2 px-4">
                                        <Button
                                            isLoading={submitFeedbackMutation.isPending}
                                            disabled={submitFeedbackMutation.isPending}
                                            type="submit"
                                            variant="gradient"
                                        >
                                            Submit
                                        </Button>
                                        <Button
                                            disabled={submitFeedbackMutation.isPending}
                                            type="button"
                                            variant="outline"
                                            color="ghost"
                                            onClick={handleModalClose}
                                        >
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
}
