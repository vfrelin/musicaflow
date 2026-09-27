// MusicaFlow Service Worker - Network First to prevent stale chunks
const CACHE_NAME = 'musicaflow-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clear any old caches from previous versions immediately
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Never intercept YouTube API or streaming requests
  if (
    event.request.url.includes('youtube.com') ||
    event.request.url.includes('googlevideo.com') ||
    event.request.url.includes('ytimg.com') ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('piped') ||
    event.request.url.includes('invidious')
  ) {
    return;
  }

  // Network first: always get the latest bundle from Vercel
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
