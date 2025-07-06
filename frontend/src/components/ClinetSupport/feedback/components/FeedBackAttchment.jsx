import React, { useContext, useState } from 'react';
import { saveAs } from 'file-saver';
import { Download, Eye, Image, Trash } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addFeedbackImages, deleteFeedbackImage } from '@/service/clinetFeedback.service';
import { feedBackListQueryKeys } from '../utils';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { Button } from '@/components/ui/button';
import FileUploadArea from './FileUploadArea';
import ImageViewerModal from './ImageViewerModal';
import { PermissionsContext } from '@/contexts/PermissionsContext';

export default function FeedBackAttchment({ images, newImages, setNewImages, selectedRow }) {
    const { isSuperAdmin } = useContext(PermissionsContext);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const queryClient = useQueryClient();

    const addImageMutation = useMutation({
        mutationFn: (data) => addFeedbackImages(selectedRow?.unique_id, data),
        onSuccess: () => {
            setNewImages([]);
            queryClient.invalidateQueries([feedBackListQueryKeys['FEEDBACK_DETAIL'], selectedRow?.unique_id]);
            toastSuccess('Image added successfully');
        },
        onError: (error) => toastError(`Error adding image: ${error?.err?.message}`),
    });

    const deleteImageMutation = useMutation({
        mutationFn: (imageId) => deleteFeedbackImage(selectedRow?.unique_id, imageId),
        onSuccess: () => {
            queryClient.invalidateQueries([feedBackListQueryKeys['FEEDBACK_DETAIL'], selectedRow?.unique_id]);
            toastSuccess('Image deleted successfully');
        },
        onError: (error) => toastError(`Error deleting image: ${error?.err?.message}`),
    });

    const handleUploadImages = () => {
        const formData = new FormData();
        newImages.forEach((fileItem) => formData.append('images', fileItem.file));
        addImageMutation.mutate(formData);
    };

    const handleDownloadImage = async (image) => {
        try {
            const response = await fetch(image.signed_url);
            const blob = await response.blob();
            saveAs(blob, image.original_filename || 'downloaded-image');
        } catch (error) {
            toastError(`Error downloading image: ${error?.message || 'Unknown error'}`);
        }
    };

    const handleViewImage = (imageIndex) => {
        setCurrentImageIndex(imageIndex);
        setIsViewerOpen(true);
    };

    const handleDeleteImage = (imageId) => {
        deleteImageMutation.mutate(imageId);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Feedback Attachments ({images.length})</h3>
            </div>

            {/* Existing attachments */}
            <div className="space-y-3">
                {images.map((image, index) => (
                    <div key={image.id} className="flex sm:flex-row flex-col items-center justify-between sm:p-4 p-2 bg-gray-50 rounded-lg border">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 p-2 rounded bg-green-100 text-green-600">
                                <Image size={20} />
                            </div>
                            <div>
                                <p className="sm:text-sm text-xs font-medium text-gray-900">{image.original_filename}</p>
                                <p className="sm:text-xs text-[10px] text-gray-500">File Size: {formatFileSize(image.file_size_bytes)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="xs"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-1 "
                                onClick={() => handleViewImage(index)}
                            >
                                <Eye size={16} /> View
                            </Button>
                            <Button
                                variant="ghost"
                                size="xs"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 flex items-center justify-center gap-1"
                                onClick={() => handleDownloadImage(image)}
                            >
                                <Download size={16} /> Download
                            </Button>
                            {!isSuperAdmin && <Button
                                variant="ghost"
                                size="xs"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center gap-1"
                                onClick={() => handleDeleteImage(image.unique_id)}
                                disabled={deleteImageMutation.isPending}
                            >
                                <Trash size={16} /> Delete
                            </Button>}
                        </div>
                    </div>
                ))}
            </div>

            {/* File Upload Area */}
            <FileUploadArea
                files={newImages}
                setFiles={setNewImages}
                uploading={addImageMutation.isPending}
                disabled={false}
                onUpload={handleUploadImages}
            />

            {/* Upload Button */}
            {newImages.length > 0 && (
                <div className="flex justify-end">
                    <Button
                        onClick={handleUploadImages}
                        disabled={addImageMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {addImageMutation.isPending ? 'Uploading...' : 'Upload Files'}
                    </Button>
                </div>
            )}

            {/* Image Viewer Modal */}
            <ImageViewerModal
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                images={images}
                currentImageIndex={currentImageIndex}
                setCurrentImageIndex={setCurrentImageIndex}
            />
        </div>
    );
}