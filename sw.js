const CACHE_NAME = 'fg-cache-v8';

// Static assets to cache on install
const PRECACHE = ['/', '/index.html', '/fear-greed.html', '/asset.html', '/compound.html', '/goal.html', '/journal.html', '/backtest.html', '/workout.html', '/agents.html', '/commerce.html', '/manifest.json', '/icon.svg'];

// URL prefixes that use network-first (fall back to cache)
const NETWORK_FIRST_PREFIXES = [
    'https://production.dataviz.cnn.io',
    'https://query1.finance.yahoo.com',
    'https://open.er-api.com',
    'https://corsproxy.io',
];

// URL prefixes that use cache-first
const CACHE_FIRST_PREFIXES = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { url } = event.request;

    if (NETWORK_FIRST_PREFIXES.some((p) => url.startsWith(p))) {
        event.respondWith(networkFirst(event.request));
        return;
    }
    if (CACHE_FIRST_PREFIXES.some((p) => url.startsWith(p))) {
        event.respondWith(cacheFirst(event.request));
        return;
    }
    // Own origin: prefer fresh content, then fall back to cache
    if (event.request.method === 'GET') {
        event.respondWith(networkFirst(event.request));
    }
});

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        return cached ?? Response.error();
    }
}

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return Response.error();
    }
}
