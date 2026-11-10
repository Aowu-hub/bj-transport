/* sw.js — BJ Transport installable app. Keeps the app on the phone so it opens instantly.
 * Built by site/build.mjs: __BJ_VERSION__ and __BJ_FILES__ ({ path: hash }) are filled in.
 * Only files whose hash changed are downloaded on an update; the server (/exec) and Drive images are never cached here. */
var VERSION = "v2026.11.10-1818";
var FILES = {"fonts/sarabun-latin-400-normal.woff2":"e4c8d9eb25e0f1c7","fonts/sarabun-latin-500-normal.woff2":"c8e39cbd33c50101","fonts/sarabun-latin-600-normal.woff2":"010bf17a7bca9e60","fonts/sarabun-latin-700-normal.woff2":"7ac242ca01033f14","fonts/sarabun-latin-800-normal.woff2":"4509f48e0d6725e5","fonts/sarabun-thai-400-normal.woff2":"7255a0ff175fc233","fonts/sarabun-thai-500-normal.woff2":"1a35f22ee94681b7","fonts/sarabun-thai-600-normal.woff2":"70ff14667d6156cb","fonts/sarabun-thai-700-normal.woff2":"08e53442748a876d","fonts/sarabun-thai-800-normal.woff2":"9cc4ae0391738481","icons/apple-touch-icon.png":"9de5771c58b5bc11","icons/favicon-32.png":"2579b268a53de72f","icons/icon-192.png":"f7eeb00c12f68c34","icons/icon-512.png":"befe734475ad2e84","icons/icon-maskable-512.png":"a4929f2f55f01380","index.html":"01bca0e2d02e5239","manifest.webmanifest":"3694f1f6f8478dc3","version.js":"2caf9a757cab956b"};
var CACHE = 'bjt-' + VERSION;
var BASE = self.registration.scope;
function key(p, h) { return BASE + p + '?h=' + h; }

self.addEventListener('install', function (ev) {
  ev.waitUntil(caches.open(CACHE).then(function (cache) {
    return Promise.all(Object.keys(FILES).map(function (p) {
      var k = key(p, FILES[p]);
      return caches.match(k).then(function (hit) {
        if (hit) return cache.put(k, hit);                       // unchanged → reuse, no download
        return fetch(new Request(BASE + p, { cache: 'reload' })).then(function (r) {
          if (!r.ok) throw new Error('download failed: ' + p);
          return cache.put(k, r);
        });
      });
    }));
  }));
});

self.addEventListener('activate', function (ev) {
  ev.waitUntil(caches.keys().then(function (names) {
    return Promise.all(names.filter(function (n) { return n.indexOf('bjt-') === 0 && n !== CACHE; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('message', function (ev) { if (ev.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', function (ev) {
  var req = ev.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin || url.href.indexOf(BASE) !== 0) return;
  var p = url.pathname.slice(new URL(BASE).pathname.length);
  if (req.mode === 'navigate' || p === '') p = 'index.html';
  if (!FILES[p]) return;
  ev.respondWith(caches.open(CACHE).then(function (c) { return c.match(key(p, FILES[p])); }).then(function (hit) {
    return hit || fetch(req);
  }));
});
