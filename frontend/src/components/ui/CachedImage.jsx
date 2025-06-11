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
    showCacheStatus = process.env.NODE_ENV === 'development',
    onLoad,
    onError,
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isVisible, setIsVisible] = useState(!lazy);
    const [cacheStatus, setCacheStatus] = useState('loading');

    const imgRef = useRef(null);
    const mountedRef = useRef(true);
    
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

                // Check cache first
                const cachedImage = imageCache.getFromCache(src, { width, height, quality });
                if (cachedImage && mountedRef.current) {
                    setImageSrc(cachedImage);
                    setIsLoading(false);
                    setCacheStatus(cachedImage.startsWith('blob:') ? 'cached' : 'network');
                    onLoad?.();
                    return;
                }

                // Preload and cache the image
                const optimizedSrc = await imageCache.preloadImage(src, { width, height, quality });
                
                if (mountedRef.current) {
                    setImageSrc(optimizedSrc);
                    setIsLoading(false);
                    setCacheStatus(optimizedSrc.startsWith('blob:') ? 'cached' : 'network');
                    onLoad?.();
                }
            } catch (error) {
                console.warn('Image loading failed:', error);
                if (mountedRef.current) {
                    setHasError(true);
                    setIsLoading(false);
                    setCacheStatus('error');
                    onError?.(error);
                }
            }
        };

        loadImage();
    }, [src, isVisible, width, height, quality, onLoad, onError]);

    // Cleanup on unmount only
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            // Don't revoke blob URLs here - let ImageCacheService manage them
        };
    }, []);

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
            {/* Cache status indicator for development */}
            {showCacheStatus && cacheStatus && (
                <div className={cn(
                    "absolute top-1 left-1 px-1 py-0.5 text-xs rounded z-20",
                    cacheStatus === 'cached' ? "bg-green-500 text-white" :
                    cacheStatus === 'network' ? "bg-blue-500 text-white" :
                    "bg-red-500 text-white"
                )}>
                    {cacheStatus === 'cached' ? '💾' : cacheStatus === 'network' ? '🌐' : '❌'}
                </div>
            )}
            
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
                    onLoad={() => {
                        if (mountedRef.current) {
                            setIsLoading(false);
                            onLoad?.();
                        }
                    }}
                    onError={(e) => {
                        if (mountedRef.current) {
                            setHasError(true);
                            setIsLoading(false);
                            onError?.(e);
                        }
                    }}
                />
            )}
        </div>
    );
});

CachedImage.displayName = 'CachedImage';

export { CachedImage };