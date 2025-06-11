export class BlobHealthChecker {
    static async checkBlobUrl(blobUrl) {
        if (!blobUrl || !blobUrl.startsWith('blob:')) {
            return { valid: false, reason: 'Not a blob URL' };
        }

        try {
            const response = await fetch(blobUrl);
            if (response.ok) {
                return { valid: true, size: response.headers.get('content-length') };
            } else {
                return { valid: false, reason: `HTTP ${response.status}` };
            }
        } catch (error) {
            return { valid: false, reason: error.message };
        }
    }

    static async validateCacheIntegrity() {
        const stats = imageCache.getCacheStats();
        const results = {
            total: stats.memorySize,
            valid: 0,
            invalid: 0,
            errors: []
        };

        for (const [key, url] of imageCache.cache.entries()) {
            if (url.startsWith('blob:')) {
                const check = await this.checkBlobUrl(url);
                if (check.valid) {
                    results.valid++;
                } else {
                    results.invalid++;
                    results.errors.push({ key, url, reason: check.reason });
                }
            } else {
                results.valid++; // Network URLs are assumed valid
            }
        }

        return results;
    }

    static async repairCorruptedBlobs() {
        const integrity = await this.validateCacheIntegrity();
        
        if (integrity.invalid > 0) {
            console.warn(`Found ${integrity.invalid} corrupted blob URLs, attempting repair...`);
            
            for (const error of integrity.errors) {
                // Remove corrupted entry
                imageCache.cache.delete(error.key);
                
                // Extract original URL from cache key
                const originalUrl = error.key.split('_')[0];
                
                // Re-cache the image
                try {
                    await imageCache.preloadImage(originalUrl);
                    console.log(`Repaired blob for: ${originalUrl}`);
                } catch (repairError) {
                    console.error(`Failed to repair blob for: ${originalUrl}`, repairError);
                }
            }
        }
        
        return integrity;
    }
}

// Add to window for debugging
if (process.env.NODE_ENV === 'development') {
    window.blobHealthChecker = BlobHealthChecker;
}