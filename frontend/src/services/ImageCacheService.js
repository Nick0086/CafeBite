class ImageCacheService {
    constructor() {
        this.cache = new Map();
        this.preloadQueue = new Set();
        this.maxCacheSize = 100;
        this.compressionQuality = 0.8;
    }

    generateCacheKey(url, options = {}) {
        const { width, height, quality } = options;
        return `${url}_${width || 'auto'}_${height || 'auto'}_${quality || 'default'}`;
    }

    async preloadImage(url, options = {}) {
        if (!url) return null;
        
        const cacheKey = this.generateCacheKey(url, options);
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (this.preloadQueue.has(cacheKey)) {
            return new Promise((resolve) => {
                const checkCache = () => {
                    if (this.cache.has(cacheKey)) {
                        resolve(this.cache.get(cacheKey));
                    } else {
                        setTimeout(checkCache, 50);
                    }
                };
                checkCache();
            });
        }

        this.preloadQueue.add(cacheKey);

        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            return new Promise((resolve, reject) => {
                img.onload = () => {
                    this.addToCache(cacheKey, url);
                    this.preloadQueue.delete(cacheKey);
                    resolve(url);
                };
                
                img.onerror = () => {
                    this.preloadQueue.delete(cacheKey);
                    resolve(url); // Fallback to original URL
                };
                
                img.src = url;
            });
        } catch (error) {
            this.preloadQueue.delete(cacheKey);
            return url;
        }
    }

    addToCache(key, value) {
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    getFromCache(url, options = {}) {
        const cacheKey = this.generateCacheKey(url, options);
        return this.cache.get(cacheKey);
    }

    async preloadImages(urls, options = {}) {
        const promises = urls.map(url => 
            this.preloadImage(url, options).catch(() => url)
        );
        return Promise.allSettled(promises);
    }

    clearCache() {
        this.cache.clear();
        this.preloadQueue.clear();
    }

    getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
            preloadQueueSize: this.preloadQueue.size
        };
    }
}

export const imageCache = new ImageCacheService();