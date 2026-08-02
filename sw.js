importScripts('/js/site-version.js');
const CACHE_NAME = self.VinhSiteVersion?.cacheName || 'vinhonhat-runtime';
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/shell-r8.css',
    '/js/site-version.js',
    '/js/script.js',
    '/js/lunar-calendar.js',
    '/js/holidays.js',
    '/manifest.json',
    '/data/posts-index.json',
    '/data/site-config.json',
    '/data/banner-config.json',
    '/data/categories.json',
    '/css/category-page.css',
    '/js/category-page.js',
    '/pages/pages-baiviet/bai-viet-hd.html',
    '/pages/pages-baiviet/rakuten.html',
    '/pages/pages-baiviet/seven.html',
    '/pages/pages-baiviet/sim.html',
    '/pages/pages-baiviet/other.html',
    '/pages/pages-hoctap/hoctap.html',
    '/pages/pages-hoctap/nihongo.html',
    '/pages/pages-hoctap/tokutei.html',
    '/pages/pages-giaitri/giaitri.html',
    '/pages/pages-app/tai-xuong.html',
    '/pages/pages-app/sim-data.html',
    '/css/sim-shop.css',
    '/js/sim-shop.js',
    '/data/sim-plans.json',
    '/hf/header.html',
    '/hf/footer.html'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => Promise.allSettled(CORE_ASSETS.map(asset => cache.add(asset))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    try {
        const response = await fetch(request, { cache: 'no-store' });
        if (response && response.ok) cache.put(request, response.clone());
        return response;
    } catch (error) {
        return (await cache.match(request))
            || (await cache.match(request, { ignoreSearch: true }))
            || (request.mode === 'navigate' ? cache.match('/index.html') : Response.error());
    }
}

async function staleWhileRevalidate(request, ignoreSearch = false) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch });
    const update = fetch(request).then(response => {
        if (response && response.ok) cache.put(request, response.clone());
        return response;
    }).catch(() => null);
    if (cached) {
        update.catch(() => null);
        return cached;
    }
    return (await update) || Response.error();
}

async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response && response.ok) cache.put(request, response.clone());
        return response;
    } catch (_) {
        return Response.error();
    }
}

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    const extension = url.pathname.split('.').pop()?.toLowerCase();
    if (url.pathname === '/js/site-version.js') {
        event.respondWith(networkFirst(request));
        return;
    }
    if (request.mode === 'navigate' || extension === 'html' || extension === 'json' || url.pathname.startsWith('/hf/')) {
        event.respondWith(networkFirst(request));
        return;
    }
    if (extension === 'js' || extension === 'css') {
        // Giữ query phiên bản để Beta mới không bị trả nhầm file JavaScript/CSS cũ.
        event.respondWith(staleWhileRevalidate(request, false));
        return;
    }
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'ico', 'woff', 'woff2'].includes(extension)) {
        event.respondWith(cacheFirst(request));
    }
});
