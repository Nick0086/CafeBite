import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/tremor-dialog';
import { Button } from '@/components/ui/button';
import { saveAs } from 'file-saver';
import { toastError } from '@/utils/toast-utils';

export default function ImageViewerModal({ 
    isOpen, 
    onClose, 
    images, 
    currentImageIndex, 
    setCurrentImageIndex 
}) {
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    const currentImage = images[currentImageIndex];

    const handlePrevious = () => {
        setCurrentImageIndex((prev) => 
            prev === 0 ? images.length - 1 : prev - 1
        );
        setImageError(false);
    };

    const handleNext = () => {
        setCurrentImageIndex((prev) => 
            prev === images.length - 1 ? 0 : prev + 1
        );
        setImageError(false);
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

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') handlePrevious();
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'Escape') onClose();
    };

    if (!currentImage) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent  showClose={false} className="max-w-5xl p-0 z-[9999] overflow-hidden "onKeyDown={handleKeyDown} stopOutsideClick={true}>
                <DialogHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg font-semibold text-wrap break-words">
                            {currentImage.original_filename}
                        </DialogTitle>
                        <div className="flex 1 items-center gap-2">
                            <span className="text-sm text-gray-500">
                                {currentImageIndex + 1} of {images.length}
                            </span>
                            <Button variant="ghost" size="smicon" onClick={() => handleDownloadImage(currentImage)}className="text-green-600 hover:text-green-700 hover:bg-green-100">
                                <Download size={16} />
                            </Button>
                            <Button variant="ghost" size="smicon" onClick={onClose}className="text-red-600 hover:text-red-700 hover:bg-red-100">
                                <X size={16} />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="relative flex-1 min-h-0 max-h-[80vh] overflow-auto">
                    {/* Image Container */}
                    <div className="relative flex items-center justify-center h-[60vh] bg-gray-100">
                        {imageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                        
                        {imageError ? (
                            <div className="flex flex-col items-center justify-center text-gray-500">
                                <p className="text-lg mb-2">Failed to load image</p>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                        setImageError(false);
                                        setImageLoading(true);
                                    }}
                                >
                                    Retry
                                </Button>
                            </div>
                        ) : (
                            <img
                                src={currentImage.signed_url}
                                alt={currentImage.original_filename}
                                className="max-w-full max-h-full object-contain"
                                onLoad={() => setImageLoading(false)}
                                onError={() => {
                                    setImageLoading(false);
                                    setImageError(true);
                                }}
                                onLoadStart={() => setImageLoading(true)}
                            />
                        )}

                        {/* Navigation Buttons */}
                        {images.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
                                    onClick={handlePrevious}
                                >
                                    <ChevronLeft size={20} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
                                    onClick={handleNext}
                                >
                                    <ChevronRight size={20} />
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Image Info */}
                    {/* <div className="p-4 bg-gray-50 border-t">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>File: {currentImage.original_filename}</span>
                            <span>Size: {formatFileSize(currentImage.file_size_bytes)}</span>
                        </div>
                    </div> */}
                </div>

                {/* Thumbnail Navigation */}
                {images.length > 1 && (
                    <div className="p-4 border-t bg-white flex items-center justify-center">
                        <div className="flex  gap-2 max-w-[400px] overflow-x-auto">
                            {images.map((image, index) => (
                                <button
                                    key={image.id}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                                        index === currentImageIndex
                                            ? 'border-blue-500 ring-2 ring-blue-200'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <img
                                        src={image.signed_url}
                                        alt={image.original_filename}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

// Helper function (move this to utils if not already there)
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};