const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export function register(config) {
    if ('serviceWorker' in navigator) {
        const publicUrl = new URL('https://cafe-bite.vercel.app' || '', window.location.href);
        if (publicUrl.origin !== window.location.origin) {
            return;
        }

        window.addEventListener('load', () => {
            const swUrl = `${'https://cafe-bite.vercel.app' || ''}/sw.js`;

            if (isLocalhost) {
                checkValidServiceWorker(swUrl, config);
                navigator.serviceWorker.ready.then(() => {
                    console.log('Service worker is ready for localhost');
                });
            } else {
                registerValidSW(swUrl, config);
            }
        });
    }
}

function registerValidSW(swUrl, config) {
    navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
            console.log('SW registered successfully:', registration);
            
            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                if (installingWorker == null) {
                    return;
                }
                
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            console.log('New content available; please refresh.');
                            if (config && config.onUpdate) {
                                config.onUpdate(registration);
                            }
                        } else {
                            console.log('Content is cached for offline use.');
                            if (config && config.onSuccess) {
                                config.onSuccess(registration);
                            }
                        }
                    }
                };
            };
        })
        .catch((error) => {
            console.log('SW registration failed:', error);
        });
}

function checkValidServiceWorker(swUrl, config) {
    fetch(swUrl, {
        headers: { 'Service-Worker': 'script' },
    })
        .then((response) => {
            const contentType = response.headers.get('content-type');
            if (
                response.status === 404 ||
                (contentType != null && contentType.indexOf('javascript') === -1)
            ) {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.unregister().then(() => {
                        window.location.reload();
                    });
                });
            } else {
                registerValidSW(swUrl, config);
            }
        })
        .catch(() => {
            console.log('No internet connection found. App is running in offline mode.');
        });
}

export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister();
            })
            .catch((error) => {
                console.error(error.message);
            });
    }
}

// Get cache statistics
export function getCacheStats() {
    return new Promise((resolve) => {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            
            navigator.serviceWorker.controller.postMessage(
                { type: 'GET_CACHE_STATS' },
                [messageChannel.port2]
            );
        } else {
            resolve({ error: 'Service Worker not available' });
        }
    });
}