// ============================================
// SERVICE WORKER - GOUDRON CONNECT
// Version: 1.0.0
// ============================================

const CACHE_NAME = 'goudron-cache-v1.0';
const OFFLINE_CACHE = 'goudron-offline-v1.0';
const API_CACHE = 'goudron-api-v1.0';

// Fichiers à mettre en cache IMMÉDIATEMENT
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/icons/icon-72x72.png',
  '/icons/icon-144x144.png',
  
  // Routes principales
  '/carte',
  '/scanner',
  '/chauffeur',
  '/coxer',
  '/admin'
];

// ============================================
// 1. INSTALLATION
// ============================================
self.addEventListener('install', (event) => {
  console.log('⚙️ Service Worker: Installation...');
  
  event.waitUntil(
    Promise.all([
      // Cache des assets statiques
      caches.open(CACHE_NAME).then(cache => {
        console.log('📦 Mise en cache des assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Activation immédiate
      self.skipWaiting()
    ])
  );
});

// ============================================
// 2. ACTIVATION
// ============================================
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activation...');
  
  event.waitUntil(
    Promise.all([
      // Nettoyer les anciens caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (![CACHE_NAME, OFFLINE_CACHE, API_CACHE].includes(cacheName)) {
              console.log(`🗑️ Suppression ancien cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Prendre le contrôle immédiat
      self.clients.claim()
    ])
  );
});

// ============================================
// 3. STRATÉGIE DE CACHE INTELLIGENTE
// ============================================
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // === STRATÉGIE 1: API Requests (Network First) ===
  if (url.pathname.startsWith('/api/')) {
    return handleApiRequest(event);
  }
  
  // === STRATÉGIE 2: Assets statiques (Cache First) ===
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    return event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(event.request)
            .then(response => {
              // Mettre en cache pour la prochaine fois
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, responseClone));
              }
              return response;
            })
            .catch(() => {
              // Fallback pour les images
              if (event.request.destination === 'image') {
                return caches.match('/logo192.png');
              }
            });
        })
    );
  }
  
  // === STRATÉGIE 3: Pages HTML (Network First avec fallback) ===
  return event.respondWith(
    fetch(event.request)
      .then(response => {
        // Mettre à jour le cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => {
        // Offline: servir depuis le cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Fallback générique
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// ============================================
// 4. GESTION DES REQUÊTES API
// ============================================
function handleApiRequest(event) {
  const url = event.request.url;
  
  // API qui nécessite du cache (ex: lignes de bus)
  if (url.includes('/api/lines') || url.includes('/api/stations')) {
    return event.respondWith(
      networkFirstWithCache(event.request, API_CACHE)
    );
  }
  
  // API en temps réel (GPS) - pas de cache
  if (url.includes('/api/gps') || url.includes('/api/live')) {
    return event.respondWith(fetch(event.request));
  }
  
  // Par défaut: Network First
  return event.respondWith(networkFirstWithCache(event.request, API_CACHE));
}

function networkFirstWithCache(request, cacheName) {
  return fetch(request)
    .then(networkResponse => {
      // Mettre en cache si succès
      if (networkResponse.ok) {
        const clone = networkResponse.clone();
        caches.open(cacheName)
          .then(cache => cache.put(request, clone));
      }
      return networkResponse;
    })
    .catch(() => {
      // Offline: servir depuis le cache
      return caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Données offline par défaut
          if (request.url.includes('/api/lines')) {
            return new Response(JSON.stringify({
              lines: [
                { id: 1, name: 'Yopougon - Plateau', color: '#FF6B00' },
                { id: 2, name: 'Adjamé - Cocody', color: '#00B894' },
                { id: 3, name: 'Treichville - Marcory', color: '#0984E3' }
              ]
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          return new Response(JSON.stringify({ 
            offline: true, 
            message: 'Mode hors-ligne activé',
            timestamp: Date.now()
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        });
    });
}

// ============================================
// 5. SYNC BACKGROUND (GPS OFFLINE)
// ============================================
self.addEventListener('sync', (event) => {
  console.log('🔄 Sync Event:', event.tag);
  
  if (event.tag === 'sync-gps-positions') {
    event.waitUntil(syncGPSPositions());
  }
  
  if (event.tag === 'sync-qr-scans') {
    event.waitUntil(syncQRScans());
  }
});

async function syncGPSPositions() {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const keys = await cache.keys();
    const gpsRequests = keys.filter(key => key.url.includes('/api/gps'));
    
    for (const request of gpsRequests) {
      const response = await cache.match(request);
      const data = await response.json();
      
      // Envoyer au serveur
      const syncResponse = await fetch('/api/gps/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (syncResponse.ok) {
        await cache.delete(request);
        console.log('✅ Position GPS synchronisée');
      }
    }
  } catch (error) {
    console.error('❌ Erreur sync GPS:', error);
  }
}

async function syncQRScans() {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const keys = await cache.keys();
    const scanRequests = keys.filter(key => key.url.includes('/api/scans'));
    
    for (const request of scanRequests) {
      const response = await cache.match(request);
      const data = await response.json();
      
      const syncResponse = await fetch('/api/scans/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (syncResponse.ok) {
        await cache.delete(request);
        console.log('✅ Scan QR synchronisé');
      }
    }
  } catch (error) {
    console.error('❌ Erreur sync scans:', error);
  }
}

// ============================================
// 6. NOTIFICATIONS PUSH
// ============================================
self.addEventListener('push', (event) => {
  console.log('🔔 Push Notification reçue');
  
  let data = { title: 'Goudron-Connect', body: 'Nouvelle notification' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'goudron-notif',
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
      type: data.type || 'info'
    },
    actions: []
  };
  
  // Actions selon le type
  if (data.type === 'traffic') {
    options.actions.push({
      action: 'view-map',
      title: '🗺️ Voir carte',
      icon: '/icons/map.png'
    });
  }
  
  if (data.type === 'points') {
    options.actions.push({
      action: 'view-wallet',
      title: '💰 Mon portefeuille',
      icon: '/icons/wallet.png'
    });
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  if (event.action === 'view-map') {
    clients.openWindow('/carte');
  } else if (event.action === 'view-wallet') {
    clients.openWindow('/wallet');
  } else {
    clients.openWindow(urlToOpen);
  }
});

// ============================================
// 7. MESSAGE HANDLER (Communication avec l'app)
// ============================================
self.addEventListener('message', (event) => {
  console.log('📨 Message reçu:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_ASSETS') {
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(event.data.urls));
  }
});

// ============================================
// 8. GESTION OFFLINE AVANCÉE
// ============================================
function saveForLater(url, data) {
  return caches.open(OFFLINE_CACHE)
    .then(cache => {
      const request = new Request(url);
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      });
      return cache.put(request, response);
    });
}

// Exporter pour tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CACHE_NAME,
    STATIC_ASSETS,
    handleApiRequest,
    networkFirstWithCache,
    saveForLater
  };
}