import { useEffect, useCallback, useRef } from 'react';
import { imageCache } from '@/services/ImageCacheService';

export const useMenuPreloader = (menuConfig, options = {}) => {
    const { preloadImages = true, batchSize = 5, priority = 'visible' } = options;
    const preloadedRef = useRef(new Set());

    const preloadMenuImages = useCallback(async () => {
        if (!preloadImages || !menuConfig?.categories) return;

        const imageUrls = [];
        const preloadKey = JSON.stringify(menuConfig?.categories?.map(c => c.unique_id));
        
        // Avoid duplicate preloading
        if (preloadedRef.current.has(preloadKey)) {
            return;
        }

        menuConfig.categories.forEach(category => {
            if (!category.visible) return;
            
            category.items?.forEach(item => {
                if (item.visible && item.image_details?.url) {
                    imageUrls.push(item.image_details.url);
                }
            });
        });

        if (imageUrls.length === 0) return;

        console.log(`Preloading ${imageUrls.length} images in batches of ${batchSize}`);
        
        // Mark as being preloaded
        preloadedRef.current.add(preloadKey);

        try {
            // Preload in batches with proper error handling
            for (let i = 0; i < imageUrls.length; i += batchSize) {
                const batch = imageUrls.slice(i, i + batchSize);
                
                const batchPromises = batch.map(async (url) => {
                    try {
                        return await imageCache.preloadImage(url, { 
                            width: 400, 
                            height: 300, 
                            quality: 0.8 
                        });
                    } catch (error) {
                        console.warn(`Failed to preload image: ${url}`, error);
                        return null;
                    }
                });

                await Promise.allSettled(batchPromises);
                
                // Small delay between batches to avoid overwhelming the browser
                if (i + batchSize < imageUrls.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            console.log('Image preloading completed');
        } catch (error) {
            console.error('Image preloading failed:', error);
        }
    }, [menuConfig, preloadImages, batchSize]);

    useEffect(() => {
        if (!menuConfig?.categories) return;

        if (priority === 'visible') {
            // Delay preloading to allow initial render
            const timer = setTimeout(preloadMenuImages, 1000);
            return () => clearTimeout(timer);
        } else if (priority === 'all') {
            preloadMenuImages();
        }
    }, [preloadMenuImages, priority]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            preloadedRef.current.clear();
        };
    }, []);

    return { preloadMenuImages };
};