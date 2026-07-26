import { imageCache } from '@/lib/ImageCacheService';

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
        imageCache.clearCache();
        await imageCache.clearIndexedDB();
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_IMAGE_CACHE' });
        }
        if (import.meta.env.DEV) console.log('All caches cleared');
    }

    static logCacheStats() {
        if (!import.meta.env.DEV) return;
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
if (import.meta.env.DEV) {
    window.cacheDebugger = CacheDebugger;
}