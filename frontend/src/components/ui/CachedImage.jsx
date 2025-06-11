import React, { useState, useEffect, useRef, memo } from 'react';
import { useInView } from 'react-intersection-observer';
import { imageCache } from '@/services/ImageCacheService';
import { ImagePlaceholder } from './Iimage-placeholder';
import { cn } from '@/lib/utils';

const CachedImage = memo(({
    src,
    alt,
    className,
    width = 400,
    height = 300,
    quality = 0.8,
    placeholder = true,
    lazy = true,
    onLoad,
    onError,
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isVisible, setIsVisible] = useState(!lazy);

    const imgRef = useRef(null);
    const { ref: inViewRef, inView } = useInView({
        threshold: 0.1,
        rootMargin: '200px',
        triggerOnce: true,
        skip: !lazy
    });

    const setRefs = (element) => {
        imgRef.current = element;
        inViewRef(element);
    };

    useEffect(() => {
        if (lazy && inView) {
            setIsVisible(true);
        }
    }, [inView, lazy]);

    useEffect(() => {
        if (!src || !isVisible) return;

        const loadImage = async () => {
            try {
                setIsLoading(true);
                setHasError(false);

                const cachedImage = imageCache.getFromCache(src, { width, height, quality });
                if (cachedImage) {
                    setImageSrc(cachedImage);
                    setIsLoading(false);
                    onLoad?.();
                    return;
                }

                const optimizedSrc = await imageCache.preloadImage(src, { width, height, quality });
                setImageSrc(optimizedSrc);
                setIsLoading(false);
                onLoad?.();
            } catch (error) {
                console.warn('Image loading failed:', error);
                setHasError(true);
                setIsLoading(false);
                onError?.(error);
            }
        };

        loadImage();
    }, [src, isVisible, width, height, quality, onLoad, onError]);

    if (!isVisible) {
        return (
            <div
                ref={setRefs}
                className={cn("bg-gray-100 animate-pulse rounded-lg", className)}
                style={{ width, height }}
                {...props}
            />
        );
    }

    if (hasError) {
        return (
            <div
                className={cn("flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg", className)}
                style={{ width, height }}
                {...props}
            >
                <span className="text-sm">Image unavailable</span>
            </div>
        );
    }

    return (
        <div ref={setRefs} className={cn("relative overflow-hidden rounded-lg", className)} {...props}>
            {isLoading && placeholder && (
                <div className="absolute inset-0 z-10">
                    <ImagePlaceholder />
                </div>
            )}
            {imageSrc && (
                <img
                    src={imageSrc}
                    alt={alt}
                    className={cn(
                        "w-full h-full object-cover transition-opacity duration-300",
                        isLoading ? "opacity-0" : "opacity-100"
                    )}
                    loading="lazy"
                    decoding="async"
                />
            )}
        </div>
    );
});

CachedImage.displayName = 'CachedImage';

export { CachedImage };