import React, { useState, useRef } from 'react';
import { Upload, X, Image, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// File Upload Component
const FileUploadArea = ({ files, setFiles, uploading, disabled = false }) => {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFiles = (fileList) => {
        const validFiles = Array.from(fileList).filter(file => {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            const maxSize = 10 * 1024 * 1024; // 10MB - matches your backend

            if (!validTypes.includes(file.type)) {
                alert(`${file.name} is not a valid image type. Only JPEG, PNG, WEBP, and GIF are allowed.`);
                return false;
            }

            if (file.size > maxSize) {
                alert(`${file.name} is too large. Maximum file size is 10MB.`);
                return false;
            }

            return true;
        });

        const newFiles = validFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'ready',
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        }));

        setFiles(prev => {
            const combined = [...prev, ...newFiles];
            return combined.slice(0, 5); // Max 5 files - matches your backend
        });
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const removeFile = (fileId) => {
        setFiles(prev => {
            const updated = prev.filter(f => f.id !== fileId);
            const removedFile = prev.find(f => f.id === fileId);
            if (removedFile?.preview) {
                URL.revokeObjectURL(removedFile.preview);
            }
            return updated;
        });
    };

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return <Image className="w-6 h-6" />;
        return <File className="w-6 h-6" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            <div
                className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                    dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
                    (uploading || disabled) && "opacity-50 pointer-events-none"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={uploading || disabled}
                />

                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-base font-medium mb-2">
                    Drag and drop files or{' '}
                    <button
                        type="button"
                        
                        className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                        disabled={uploading || disabled}
                    >
                        browse
                    </button>
                </p>
                <p className="text-sm text-gray-500">
                    PNG, JPG, WEBP, or GIF • Max 10MB • Max 5 files
                </p>
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-medium text-sm">Selected Files ({files.length}/5)</h4>
                    {files.map((fileItem) => (
                        <Card key={fileItem.id} className="p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div className={cn(
                                        "flex-shrink-0 p-2 rounded",
                                        fileItem.type.startsWith('image/') ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                                    )}>
                                        {getFileIcon(fileItem.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{fileItem.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(fileItem.size)}</p>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {fileItem.status === 'uploading' && (
                                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                        )}
                                        {fileItem.status === 'uploaded' && (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        )}
                                        {fileItem.status === 'error' && (
                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                        )}

                                        {fileItem.status !== 'uploading' && (
                                            <button
                                                type="button"
                                                onClick={() => removeFile(fileItem.id)}
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                                disabled={uploading || disabled}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {fileItem.status === 'uploading' && (
                                <div className="mt-2">
                                    <div className="text-xs text-gray-500 mb-1">Uploading...</div>
                                    <div className="w-full bg-gray-200 rounded-full h-1">
                                        <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileUploadArea;