const CACHE_NAME = 'gastos-cache-v1'
const OFFLINE_URLS = ['/', '/index.html']

self.addEventListener('install', (event) => {
  self.skipWaiting()

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(OFFLINE_URLS))
      .catch(() => Promise.resolve())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clonedResponse = response.clone()

        if (
          response &&
          response.status === 200 &&
          response.type === 'basic' &&
          event.request.url.startsWith(self.location.origin)
        ) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse).catch(() => {})
          })
        }

        return response
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request)

        if (cachedResponse) {
          return cachedResponse
        }

        if (event.request.mode === 'navigate') {
          const offlinePage = await caches.match('/')

          if (offlinePage) {
            return offlinePage
          }
        }

        return new Response('Recurso no disponible en modo offline', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        })
      })
  )
})
