const CACHE_NAME = 'shopping-list-v1';
const ASSETS = [
  'index.html',
  'shopping_list_stylesheet.css',
  'shopping_list_data.js',
  'shopping_list_manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
