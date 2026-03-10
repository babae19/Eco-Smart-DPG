// Enhanced Service Worker for EcoAlert - Push notifications + caching
console.log('[SW] Enhanced Service Worker script loaded');

// Cache configuration
const CACHE_NAME = 'ecoalert-v2.0';
const STATIC_CACHE_NAME = 'ecoalert-static-v2.0';
const DYNAMIC_CACHE_NAME = 'ecoalert-dynamic-v2.0';

// Critical resources to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  // Add more critical assets as needed
];

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing');
  event.waitUntil(
    Promise.all([
      // Cache critical resources
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(url => url !== undefined));
      }).catch(error => {
        console.log('[SW] Static cache setup failed:', error);
      }),
      self.skipWaiting()
    ])
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activating');
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      clients.claim()
    ])
  );
});

// Add fetch handler for caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) return;

  // Cache strategy for API requests
  if (url.pathname.includes('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          const cache = caches.open(DYNAMIC_CACHE_NAME);
          cache.then(c => c.put(request, response.clone()));
        }
        return response;
      }).catch(() => {
        return caches.match(request).then(cached => {
          return cached || new Response('Offline', { status: 503 });
        });
      })
    );
    return;
  }

  // Cache strategy for images and static assets
  if (request.destination === 'image' || url.pathname.includes('/static/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        
        return fetch(request).then(response => {
          if (response.ok) {
            const cache = caches.open(DYNAMIC_CACHE_NAME);
            cache.then(c => c.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }
});

// Handle push messages
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received:', event);

  if (!event.data) {
    console.log('[SW] No data in push message');
    return;
  }

  try {
    const data = event.data.json();
    console.log('[SW] Push data:', data);

    const options = {
      body: data.body || data.message || 'New notification',
      icon: data.icon || '/favicon.ico',
      badge: data.badge || '/favicon.ico',
      tag: data.tag || 'default',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      silent: false,
      vibrate: data.vibrate || [200, 100, 200],
      renotify: true,
      timestamp: Date.now()
    };

    // Add severity-based customization
    if (data.severity === 'high') {
      options.requireInteraction = true;
      options.vibrate = [300, 100, 300, 100, 300];
      options.actions = [
        { action: 'view', title: 'View Details', icon: '/favicon.ico' },
        { action: 'dismiss', title: 'Dismiss', icon: '/favicon.ico' }
      ];
    }

    const title = data.title || 'EcoSmart Alert';

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('[SW] Error parsing push data:', error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('EcoSmart Alert', {
        body: 'You have a new notification',
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification);

  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data || {};

  if (action === 'dismiss') {
    return;
  }

  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if the app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if app is not open
      if (clients.openWindow) {
        const targetUrl = notificationData.url || '/';
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification);
});

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    // Handle background sync for notifications when online
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    // Handle notification requests from the main thread
    const { title, body, options } = event.data.payload;
    
    self.registration.showNotification(title, {
      body,
      icon: options.icon || '/favicon.ico',
      badge: options.badge || '/favicon.ico',
      tag: options.tag || 'default',
      requireInteraction: options.requireInteraction || false,
      silent: false,
      vibrate: options.vibrate || [200, 100, 200],
      data: options.data || {},
      timestamp: options.timestamp || Date.now()
    }).catch(error => {
      console.error('[SW] Failed to show notification:', error);
    });
  }
});