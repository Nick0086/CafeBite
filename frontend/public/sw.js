const CACHE_NAME = 'cafebite-images-v1';
const IMAGE_CACHE_NAME = 'cafebite-images';

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
                // Don't fail installation if some resources can't be cached
                return Promise.resolve();
            });
        })
    );
    self.skipWaiting();
});

// Fetch event for image caching
self.addEventListener('fetch', (event) => {
    // Only handle image requests
    if (event.request.destination === 'image' || 
        event.request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        
        event.respondWith(
            caches.open(IMAGE_CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    if (response) {
                        console.log('Image served from cache:', event.request.url);
                        return response;
                    }

                    return fetch(event.request).then((fetchResponse) => {
                        // Only cache successful responses
                        if (fetchResponse.status === 200 && fetchResponse.type === 'basic') {
                            console.log('Caching image:', event.request.url);
                            cache.put(event.request, fetchResponse.clone());
                        }
                        return fetchResponse;
                    }).catch((error) => {
                        console.log('Fetch failed for:', event.request.url, error);
                        // Try to return a placeholder if available
                        return cache.match('/placeholder.jpg') || 
                               new Response('', { status: 404 });
                    });
                });
            })
        );
    }
});

// Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_CACHE_STATS') {
        caches.keys().then(cacheNames => {
            const stats = {
                caches: cacheNames,
                timestamp: Date.now()
            };
            event.ports[0].postMessage(stats);
        });
    }
});