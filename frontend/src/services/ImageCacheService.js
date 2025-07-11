class ImageCacheService {
    constructor() {
        this.cache = new Map();
        this.blobCache = new Map(); // Separate cache for blob objects
        this.preloadQueue = new Set();
        this.maxCacheSize = 100;
        this.compressionQuality = 0.8;
        this.dbName = 'CafeBiteImageCache';
        this.dbVersion = 1;
        this.initIndexedDB();
    }

    async initIndexedDB() {
        try {
            this.db = await new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.dbVersion);
                
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
                
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('images')) {
                        const store = db.createObjectStore('images', { keyPath: 'key' });
                        store.createIndex('timestamp', 'timestamp', { unique: false });
                    }
                };
            });
        } catch (error) {
            console.warn('IndexedDB initialization failed:', error);
        }
    }

    generateCacheKey(url, options = {}) {
        const { width, height, quality } = options;
        return `${url}_${width || 'auto'}_${height || 'auto'}_${quality || 'default'}`;
    }

    async getFromIndexedDB(key) {
        if (!this.db) return null;
        
        try {
            const transaction = this.db.transaction(['images'], 'readonly');
            const store = transaction.objectStore('images');
            const request = store.get(key);
            
            return new Promise((resolve) => {
                request.onsuccess = () => {
                    const result = request.result;
                    if (result && Date.now() - result.timestamp < 96 * 60 * 60 * 1000) { // 24 hours
                        resolve(result.blob);
                    } else {
                        resolve(null);
                    }
                };
                request.onerror = () => resolve(null);
            });
        } catch (error) {
            console.warn('IndexedDB read failed:', error);
            return null;
        }
    }

    async saveToIndexedDB(key, blob) {
        if (!this.db) return;
        
        try {
            const transaction = this.db.transaction(['images'], 'readwrite');
            const store = transaction.objectStore('images');
            
            await store.put({
                key,
                blob,
                timestamp: Date.now()
            });
        } catch (error) {
            console.warn('IndexedDB write failed:', error);
        }
    }

    // Create persistent blob URL that won't be revoked
    createPersistentBlobUrl(blob, key) {
        // Check if we already have a blob URL for this key
        if (this.blobCache.has(key)) {
            return this.blobCache.get(key);
        }

        const blobUrl = URL.createObjectURL(blob);
        this.blobCache.set(key, blobUrl);
        return blobUrl;
    }

    async preloadImage(url, options = {}) {
        if (!url) return null;
        
        const cacheKey = this.generateCacheKey(url, options);
        
        // Check memory cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Check IndexedDB cache
        const cachedBlob = await this.getFromIndexedDB(cacheKey);
        if (cachedBlob) {
            const objectUrl = this.createPersistentBlobUrl(cachedBlob, cacheKey);
            this.addToCache(cacheKey, objectUrl);
            return objectUrl;
        }

        // Check if already in preload queue
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
            // Fetch and cache the image
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const blob = await response.blob();
            const objectUrl = this.createPersistentBlobUrl(blob, cacheKey);
            
            // Save to both caches
            this.addToCache(cacheKey, objectUrl);
            await this.saveToIndexedDB(cacheKey, blob);
            
            this.preloadQueue.delete(cacheKey);
            return objectUrl;
            
        } catch (error) {
            console.warn('Image preload failed:', error);
            this.preloadQueue.delete(cacheKey);
            return url; // Fallback to original URL
        }
    }

    addToCache(key, value) {
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
            // Don't revoke blob URLs here - keep them in blobCache
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
        // Only revoke blob URLs when explicitly clearing cache
        for (const url of this.blobCache.values()) {
            if (url && url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        }
        this.cache.clear();
        this.blobCache.clear();
        this.preloadQueue.clear();
    }

    async clearIndexedDB() {
        if (!this.db) return;
        
        try {
            const transaction = this.db.transaction(['images'], 'readwrite');
            const store = transaction.objectStore('images');
            await store.clear();
        } catch (error) {
            console.warn('IndexedDB clear failed:', error);
        }
    }

    getCacheStats() {
        return {
            memorySize: this.cache.size,
            blobCacheSize: this.blobCache.size,
            maxSize: this.maxCacheSize,
            preloadQueueSize: this.preloadQueue.size
        };
    }
}

export const imageCache = new ImageCacheService();