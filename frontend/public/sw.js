const CACHE_NAME = 'cafebite-v1';
const IMAGE_CACHE_NAME = 'cafebite-images-v1';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/placeholder.jpg',
                '/favicon.ico'
            ]).catch(err => {
                console.log('Cache addAll failed:', err);
                return Promise.resolve();
            });
        })
    );
    self.skipWaiting();
});

// Enhanced fetch handler with better caching strategy
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Handle image requests with aggressive caching
    if (event.request.destination === 'image' ||
        event.request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {

        event.respondWith(
            caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
                try {
                    // Check cache first
                    const cachedResponse = await cache.match(event.request);

                    if (cachedResponse) {
                        // Check if cache is still valid
                        const cacheDate = cachedResponse.headers.get('sw-cache-date');
                        if (cacheDate && Date.now() - parseInt(cacheDate) < CACHE_EXPIRY) {
                            console.log('Image served from cache:', event.request.url);
                            return cachedResponse;
                        }
                    }

                    // Fetch new image
                    console.log('Fetching image:', event.request.url);
                    const fetchResponse = await fetch(event.request);

                    if (fetchResponse.status === 200) {
                        // Clone and add cache headers
                        const responseToCache = new Response(fetchResponse.body, {
                            status: fetchResponse.status,
                            statusText: fetchResponse.statusText,
                            headers: {
                                ...Object.fromEntries(fetchResponse.headers.entries()),
                                'sw-cache-date': Date.now().toString()
                            }
                        });

                        // Cache the response
                        cache.put(event.request, responseToCache.clone());
                        console.log('Image cached:', event.request.url);

                        return fetchResponse;
                    }

                    return fetchResponse;

                } catch (error) {
                    console.log('Fetch failed for:', event.request.url, error);

                    // Return cached version even if expired
                    const cachedResponse = await cache.match(event.request);
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    // Return placeholder if available
                    const placeholder = await cache.match('/placeholder.jpg');
                    return placeholder || new Response('', { status: 404 });
                }
            })
        );
    }
});

// Clean up old caches and expired entries
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        Promise.all([
            // Clean up old cache versions
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),

            // Clean up expired cache entries
            caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
                const requests = await cache.keys();
                const deletePromises = [];

                for (const request of requests) {
                    const response = await cache.match(request);
                    const cacheDate = response.headers.get('sw-cache-date');

                    if (cacheDate && Date.now() - parseInt(cacheDate) > CACHE_EXPIRY) {
                        console.log('Deleting expired cache entry:', request.url);
                        deletePromises.push(cache.delete(request));
                    }
                }

                return Promise.all(deletePromises);
            })
        ])
    );
    self.clients.claim();
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_CACHE_STATS') {
        Promise.all([
            caches.open(CACHE_NAME),
            caches.open(IMAGE_CACHE_NAME)
        ]).then(async ([mainCache, imageCache]) => {
            const mainKeys = await mainCache.keys();
            const imageKeys = await imageCache.keys();

            const stats = {
                mainCacheSize: mainKeys.length,
                imageCacheSize: imageKeys.length,
                caches: [CACHE_NAME, IMAGE_CACHE_NAME],
                timestamp: Date.now()
            };

            event.ports[0].postMessage(stats);
        });
    }

    if (event.data && event.data.type === 'CLEAR_IMAGE_CACHE') {
        caches.open(IMAGE_CACHE_NAME).then(cache => {
            cache.keys().then(requests => {
                requests.forEach(request => cache.delete(request));
            });
        });
    }
});

// Background sync for failed image requests
self.addEventListener('sync', (event) => {
    if (event.tag === 'image-retry') {
        event.waitUntil(retryFailedImages());
    }
});

async function retryFailedImages() {
    // Implementation for retrying failed image loads
    console.log('Retrying failed image loads...');
}

