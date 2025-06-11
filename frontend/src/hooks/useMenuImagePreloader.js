import { useEffect, useCallback, useRef } from 'react';
import { imageCache } from '@/services/ImageCacheService';

export const useMenuImagePreloader = (menuItems, options = {}) => {
    const {
        preloadImages = true,
        batchSize = 5,
        priority = 'visible',
        preloadDelay = 1000
    } = options;
    
    const preloadedRef = useRef(new Set());

    const preloadMenuItemImages = useCallback(async () => {
        if (!preloadImages || !menuItems?.length) return;

        const imageUrls = [];
        const preloadKey = menuItems.map(item => item.unique_id || item.id).join(',');
        
        // Avoid duplicate preloading
        if (preloadedRef.current.has(preloadKey)) {
            return;
        }

        // Collect image URLs
        menuItems.forEach(item => {
            if (item?.image_details?.url) {
                imageUrls.push(item.image_details.url);
            }
        });

        if (imageUrls.length === 0) return;

        console.log(`🖼️ Preloading ${imageUrls.length} menu item images...`);
        
        // Mark as being preloaded
        preloadedRef.current.add(preloadKey);

        try {
            // Preload in batches
            for (let i = 0; i < imageUrls.length; i += batchSize) {
                const batch = imageUrls.slice(i, i + batchSize);
                
                const batchPromises = batch.map(async (url) => {
                    try {
                        return await imageCache.preloadImage(url, { 
                            width: 400, 
                            height: 224, 
                            quality: 0.8 
                        });
                    } catch (error) {
                        console.warn(`Failed to preload menu image: ${url}`, error);
                        return null;
                    }
                });

                await Promise.allSettled(batchPromises);
                
                // Small delay between batches
                if (i + batchSize < imageUrls.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            console.log('✅ Menu item image preloading completed');
        } catch (error) {
            console.error('❌ Menu item image preloading failed:', error);
        }
    }, [menuItems, preloadImages, batchSize]);

    useEffect(() => {
        if (!menuItems?.length) return;

        if (priority === 'visible') {
            const timer = setTimeout(preloadMenuItemImages, preloadDelay);
            return () => clearTimeout(timer);
        } else if (priority === 'all') {
            preloadMenuItemImages();
        }
    }, [preloadMenuItemImages, priority, preloadDelay]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            preloadedRef.current.clear();
        };
    }, []);

    return { preloadMenuItemImages };
};