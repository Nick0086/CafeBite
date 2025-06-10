const CACHE_NAME = 'cafebite-images-v1';
const IMAGE_CACHE_NAME = 'cafebite-images';

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/placeholder.jpg',
                '/favicon.ico'
            ]);
        })
    );
});

// Fetch event for image caching
self.addEventListener('fetch', (event) => {
    if (event.request.destination === 'image') {
        event.respondWith(
            caches.open(IMAGE_CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    if (response) {
                        return response;
                    }

                    return fetch(event.request).then((fetchResponse) => {
                        // Only cache successful responses
                        if (fetchResponse.status === 200) {
                            cache.put(event.request, fetchResponse.clone());
                        }
                        return fetchResponse;
                    }).catch(() => {
                        // Return placeholder on network failure
                        return cache.match('/placeholder.jpg');
                    });
                });
            })
        );
    }
});

// Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});