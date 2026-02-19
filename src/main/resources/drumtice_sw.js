const CACHE_NAME = 'drumtice-v1.0.0';
const ASSETS_TO_CACHE = [
    './drumtive.html',
    './drumtice.js',
    './drumtice.css',
    './drumtice_manifest.json',
    './img/drumtice_192.png',
    './img/drumtice_512.png',
    './midi/in_the_end_chorus.mid',
    './midi/in_the_end_pre_chorus.mid',
    './midi/in_the_end_verse.mid',
    './midi/pop_rock.mid',
];

// Install: cache all assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching all assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    // Activate immediately without waiting for old SW to finish
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    // Take control of all pages immediately
    self.clients.claim();
});

// Fetch: serve from cache first, fall back to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            // Not in cache — fetch from network and cache for next time
            return fetch(event.request).then((response) => {
                // Only cache successful same-origin responses
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            });
        })
    );
});