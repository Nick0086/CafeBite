import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/utils/file.utils';
import { toastError } from '@/utils/toast-utils';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

const generateId = () => Math.random().toString(36).slice(2, 11);

export default function FileUploadArea({ files, setFiles, uploading, disabled = false }) {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        return () => {
            files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFiles = (fileList) => {
        const validFiles = Array.from(fileList).filter((file) => {
            if (!ALLOWED_TYPES.includes(file.type)) {
                toastError(`${file.name} is not a valid image type. Only JPEG, PNG, WEBP, and GIF are allowed.`);
                return false;
            }
            if (file.size > MAX_FILE_SIZE) {
                toastError(`${file.name} is too large. Maximum file size is 10MB.`);
                return false;
            }
            return true;
        });

        const newFiles = validFiles.map((file) => ({
            id: generateId(),
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'ready',
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        }));

        setFiles((prev) => {
            const combined = [...prev, ...newFiles].slice(0, MAX_FILES);
            if (prev.length + newFiles.length > MAX_FILES) {
                const dropped = [...prev, ...newFiles].slice(MAX_FILES);
                dropped.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
            }
            return combined;
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
        if (e.dataTransfer.files?.[0]) handleFiles(e.dataTransfer.files);
    };

    const handleInputChange = (e) => {
        if (e.target.files?.[0]) handleFiles(e.target.files);
    };

    const removeFile = (fileId) => {
        setFiles((prev) => {
            const removed = prev.find((f) => f.id === fileId);
            if (removed?.preview) URL.revokeObjectURL(removed.preview);
            return prev.filter((f) => f.id !== fileId);
        });
    };

    const getFileIcon = (type) =>
        type.startsWith('image/') ? <Image className="w-6 h-6" /> : <File className="w-6 h-6" />;

    return (
        <div className="space-y-4">
            <div
                className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
                    (uploading || disabled) && 'opacity-50 pointer-events-none'
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
                    accept={ALLOWED_TYPES.join(',')}
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={uploading || disabled}
                />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-base font-medium mb-2">
                    Drag and drop files or{' '}
                    <button type="button" className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50" disabled={uploading || disabled}>
                        browse
                    </button>
                </p>
                <p className="text-sm text-gray-500">PNG, JPG, WEBP, or GIF • Max 10MB • Max 5 files</p>
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-medium text-sm">Selected Files ({files.length}/{MAX_FILES})</h4>
                    {files.map((fileItem) => (
                        <Card key={fileItem.id} className="p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div
                                        className={cn(
                                            'flex-shrink-0 p-2 rounded',
                                            fileItem.type.startsWith('image/')
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-blue-100 text-blue-600'
                                        )}
                                    >
                                        {getFileIcon(fileItem.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{fileItem.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(fileItem.size)}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {fileItem.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                                        {fileItem.status === 'uploaded' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                        {fileItem.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
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
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
