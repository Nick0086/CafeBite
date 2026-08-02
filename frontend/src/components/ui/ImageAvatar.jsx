import { useEffect, useRef, useState } from 'react';
import { ReactPhotoEditor } from 'react-photo-editor';
import { Pencil, Trash2, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const ActionButton = ({ onClick, disabled, children, label, className }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        title={label}
        className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-50',
            className
        )}
    >
        {children}
    </button>
);

const ImageAvatar = ({ s3ImageUrl = '', onImageUpload, onDeleteImage, disabled = false }) => {
    const [uploadedImage, setUploadedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [editorOpen, setEditorOpen] = useState(false);
    const [isFetchingFile, setIsFetchingFile] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

    useEffect(() => {
        if (!editorOpen) return;
        if (uploadedImage || !s3ImageUrl) return;
        let cancelled = false;
        setIsFetchingFile(true);
        fetch(s3ImageUrl)
            .then((res) => res.blob())
            .then((blob) => {
                if (cancelled) return;
                const name = s3ImageUrl.split('/').pop()?.split('?')[0] || 'cover.jpg';
                const file = new File([blob], name, { type: blob.type || 'image/jpeg' });
                setUploadedImage(file);
            })
            .catch(() => {
                if (!cancelled) toast.error('Failed to load image for editing');
            })
            .finally(() => {
                if (!cancelled) {
                    setIsFetchingFile(false);
                    setEditorOpen(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [editorOpen, uploadedImage, s3ImageUrl]);

    const handleImageUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_SIZE_BYTES) {
            toast.warning('Please upload an image less than 5 MB.');
            return;
        }
        setUploadedImage(file);
        setEditorOpen(true);
    };

    const handleSaveImage = (file) => {
        setUploadedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        setEditorOpen(false);
        onImageUpload?.(file);
    };

    const handleDeleteImage = () => {
        setUploadedImage(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onDeleteImage?.();
    };

    const handleChangeClick = () => {
        if (disabled) return;
        fileInputRef.current?.click();
    };

    const handleEditClick = () => {
        if (disabled) return;
        if (uploadedImage || s3ImageUrl) setEditorOpen(true);
    };

    const hasImage = !!(previewUrl || s3ImageUrl);
    const imageUrl = previewUrl || s3ImageUrl;
    const canEdit = hasImage && !disabled;

    return (
        <div className="flex w-full flex-col items-center gap-2">
            <div className={cn('flex items-center justify-center gap-1.5', !hasImage && 'invisible h-0 overflow-hidden')}>
                {canEdit && (
                    <ActionButton onClick={handleEditClick} disabled={isFetchingFile} label="Edit image">
                        <Pencil className="h-4 w-4" />
                    </ActionButton>
                )}
                {hasImage && (
                    <ActionButton onClick={handleChangeClick} label="Change image">
                        <Upload className="h-4 w-4" />
                    </ActionButton>
                )}
                {hasImage && (
                    <ActionButton
                        onClick={handleDeleteImage}
                        label="Remove image"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                        <Trash2 className="h-4 w-4" />
                    </ActionButton>
                )}
            </div>

            <div
                className={cn(
                    'group relative aspect-video w-full max-w-xs overflow-hidden rounded-lg border-2 border-dashed bg-gradient-to-br from-slate-50 to-slate-100 transition-all duration-200',
                    hasImage
                        ? 'border-slate-200 hover:border-indigo-300'
                        : 'border-slate-300 hover:border-indigo-400 hover:from-indigo-50/50 hover:to-slate-50',
                    disabled && 'pointer-events-none opacity-60',
                    !disabled && 'cursor-pointer'
                )}
                onClick={!hasImage ? handleChangeClick : undefined}
                role={!hasImage ? 'button' : undefined}
                tabIndex={!hasImage ? 0 : undefined}
                onKeyDown={(e) => {
                    if (!hasImage && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleChangeClick();
                    }
                }}
            >
                {hasImage ? (
                    <img
                        src={imageUrl}
                        alt="Cover"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        draggable={false}
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-3 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 transition group-hover:bg-indigo-50 group-hover:ring-indigo-200">
                            <Upload className="h-4 w-4 text-slate-400 transition group-hover:text-indigo-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">Click to upload cover</p>
                            <p className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 5MB</p>
                        </div>
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={disabled}
            />

            <ReactPhotoEditor
                open={editorOpen}
                file={uploadedImage}
                onClose={() => setEditorOpen(false)}
                onSaveImage={handleSaveImage}
                allowColorEditing={false}
                allowDrawing={false}
                modalWidth="min(40rem, calc(100vw - 1rem))"
                modalHeight="min(90vh, calc(100dvh - 1rem))"
                canvasWidth="100%"
                canvasHeight="auto"
                maxCanvasWidth="calc(100vw - 2rem)"
                maxCanvasHeight="min(50vh, 60vw)"
            />
        </div>
    );
};

export default ImageAvatar;
