const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
    '/js/index.js',
    '/js/idb.js',
    '/manifest.json'
]
// Install the service worker
self.addEventListener('install', function (e){
e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
        console.log('installing cache : ' + CACHE_NAME)
        return cache.addAll(FILES_TO_CACHE)
    })
    )
    self.skipWaiting();
})

// Activates the Servie Worker and deletes old cache
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if(key !== CACHE_NAME && key !== VERSION) { 
                        console.log('Deleteing the old cache', key);
                        return caches.delete(key)
                    }
                })
            )
        })
    )
    self.clients.claim();
})

// Fetch requests
self.addEventListener('fetch', function(evt) {
    if (evt.request.url.includes('/api/')) {
      evt.respondWith(
        caches
          .open(VERSION)
          .then(cache => {
            return fetch(evt.request)
              .then(response => {
                // If the response was good, clone it and store it in the cache.
                if (response.status === 200) {
                  cache.put(evt.request.url, response.clone());
                }
  
                return response;
              })
              .catch(err => {
                // Network request has failed, so try & attempt to get it from the cache.
                return cache.match(evt.request);
              });
          })
          .catch(err => console.log(err))
      );
  
      return;
    }
  
    evt.respondWith(
      fetch(evt.request).catch(function() {
        return caches.match(evt.request).then(function(response) {
          if (response) {
            return response;
          } else if (evt.request.headers.get('accept').includes('text/html')) {
            // return the cached home page
            return caches.match('/');
          }
        });
      })
    );
  });