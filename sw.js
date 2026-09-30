/* ==========================================================================
   Toy Haven - service worker
   Caches the site files so pages still open without an internet connection.
   ========================================================================== */

const CACHE_NAME = "toy-haven-v2";

const CORE_FILES = [
  "./",
  "index.html",
  "products.html",
  "cart.html",
  "checkout.html",
  "wishlist.html",
  "support.html",
  "css/style.css",
  "js/data.js",
  "js/common.js",
  "js/home.js",
  "js/products.js",
  "js/cart.js",
  "js/checkout.js",
  "js/wishlist.js",
  "js/support.js",
  "manifest.json",
  "icons/icon-32.png",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "images/image1.webp",
  "images/image2.webp",
  "images/image3.webp",
  "images/image4.webp",
  "images/image5.webp",
  "images/image6.webp",
  "images/image7.webp",
  "images/image8.webp",
  "images/image9.webp",
  "images/image10.webp",
  "images/image11.webp",
  "images/image12.webp",
  "images/image13.webp",
  "images/image14.webp",
  "images/image15.webp",
  "images/image16.webp",
  "images/image17.webp",
  "images/image18.webp",
  "images/image19.webp",
  "images/image20.webp"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CORE_FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) {
          return key !== CACHE_NAME;
        }).map(function (key) {
          return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

/* Network first (so updates show), falling back to the cache when offline */
self.addEventListener("fetch", function (event) {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then(function (response) {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return response;
      })
      .catch(function () {
        return caches.match(request, { ignoreSearch: true }).then(function (cached) {
          return cached || caches.match("index.html");
        });
      })
  );
});
