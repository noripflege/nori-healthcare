// Nori PWA Service Worker
const CACHE_NAME = 'nori-pwa-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Critical files to cache for offline functionality
const CACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Network-first strategy URLs (API calls)
const NETWORK_FIRST_URLS = [
  '/api/',
  '/auth/'
];

// Cache-first strategy URLs (static assets)
const CACHE_FIRST_URLS = [
  '/icons/',
  '/screenshots/',
  '/static/',
  '.css',
  '.js',
  '.woff',
  '.woff2'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('💾 Caching critical resources');
      return cache.addAll(CACHE_URLS);
    })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Network-first strategy for API calls
  if (NETWORK_FIRST_URLS.some(pattern => url.pathname.startsWith(pattern))) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }
  
  // Cache-first strategy for static assets
  if (CACHE_FIRST_URLS.some(pattern => url.pathname.includes(pattern))) {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }
  
  // Stale-while-revalidate for HTML pages
  if (event.request.destination === 'document') {
    event.respondWith(staleWhileRevalidateStrategy(event.request));
    return;
  }
  
  // Default: network with cache fallback
  event.respondWith(networkWithCacheFallback(event.request));
});

// Network-first strategy (for API calls)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📡 Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline indicator for API calls
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'Keine Internetverbindung verfügbar' 
      }),
      { 
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache-first strategy (for static assets)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('💾 Asset not in cache and network failed:', request.url);
    throw error;
  }
}

// Stale-while-revalidate strategy (for HTML pages)
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  const networkResponsePromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(CACHE_NAME);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, return cached version if available
    return cachedResponse;
  });
  
  // Return cached version immediately if available
  return cachedResponse || networkResponsePromise;
}

// Network with cache fallback
async function networkWithCacheFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match(OFFLINE_URL);
    }
    
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-nori') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data when back online
async function syncOfflineData() {
  try {
    // Trigger sync in the main app
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_OFFLINE_DATA'
      });
    });
    
    console.log('✅ Background sync completed');
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Push notifications (for future updates)
self.addEventListener('push', (event) => {
  console.log('📲 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Neue Benachrichtigung von Nori',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 'nori-notification'
    },
    actions: [
      {
        action: 'open',
        title: 'Öffnen',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Schließen'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Nori Pflegeassistenz', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});