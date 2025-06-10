import { useEffect, useCallback } from 'react';
import { imageCache } from '@/services/ImageCacheService';

export const useMenuPreloader = (menuConfig, options = {}) => {
    const { 
        preloadImages = true, 
        batchSize = 5,
        priority = 'visible'
    } = options;

    const preloadMenuImages = useCallback(async () => {
        if (!preloadImages || !menuConfig?.categories) return;

        const imageUrls = [];
        
        menuConfig.categories.forEach(category => {
            if (!category.visible) return;
            
            category.items?.forEach(item => {
                if (item.visible && item.image_details?.url) {
                    imageUrls.push(item.image_details.url);
                }
            });
        });

        // Preload in batches
        for (let i = 0; i < imageUrls.length; i += batchSize) {
            const batch = imageUrls.slice(i, i + batchSize);
            await imageCache.preloadImages(batch, {
                width: 400,
                height: 300,
                quality: 0.8
            });
            
            if (i + batchSize < imageUrls.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }, [menuConfig, preloadImages, batchSize]);

    useEffect(() => {
        if (priority === 'visible') {
            const timer = setTimeout(preloadMenuImages, 500);
            return () => clearTimeout(timer);
        } else if (priority === 'all') {
            preloadMenuImages();
        }
    }, [preloadMenuImages, priority]);

    return { preloadMenuImages };
};