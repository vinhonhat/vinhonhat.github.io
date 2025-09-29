const CACHE_NAME = 'vinh-o-nhat-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/script.js',
  '/js/lunar-calendar.js',
  '/js/holidays.js',
  '/js/proverbs.js',
  '/manifest.json',
  '/img/logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache đã được mở');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});