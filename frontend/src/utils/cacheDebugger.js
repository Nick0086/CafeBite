import { imageCache } from '@/services/ImageCacheService';

export class CacheDebugger {
    static async getCacheStats() {
        const memoryStats = imageCache.getCacheStats();
        
        // Get Service Worker cache stats
        const swStats = await new Promise((resolve) => {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                const channel = new MessageChannel();
                channel.port1.onmessage = (event) => {
                    resolve(event.data);
                };
                navigator.serviceWorker.controller.postMessage(
                    { type: 'GET_CACHE_STATS' },
                    [channel.port2]
                );
            } else {
                resolve({ error: 'Service Worker not available' });
            }
        });

        return {
            memory: memoryStats,
            serviceWorker: swStats,
            timestamp: new Date().toISOString()
        };
    }

    static async clearAllCaches() {
        // Clear memory cache
        imageCache.clearCache();
        
        // Clear IndexedDB cache
        await imageCache.clearIndexedDB();
        
        // Clear Service Worker cache
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'CLEAR_IMAGE_CACHE'
            });
        }
        
        console.log('All caches cleared');
    }

    static logCacheStats() {
        this.getCacheStats().then(stats => {
            console.group('🖼️ Image Cache Stats');
            console.log('Memory Cache:', stats.memory);
            console.log('Service Worker Cache:', stats.serviceWorker);
            console.log('Timestamp:', stats.timestamp);
            console.groupEnd();
        });
    }
}

// Add to window for debugging in development
if (process.env.NODE_ENV === 'development') {
    window.cacheDebugger = CacheDebugger;
}