const CACHE_NAME = 'harding-homes-v1';
const OFFLINE_URL = '/offline';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome extensions and non-http(s) requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});

// Background sync for photo uploads
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-photos') {
    event.waitUntil(syncPhotos());
  }
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncPhotos() {
  const db = await openDatabase();
  const photos = await getAllPendingPhotos(db);
  
  for (const photo of photos) {
    try {
      await uploadPhoto(photo);
      await markPhotoAsSynced(db, photo.id);
    } catch (error) {
      console.error('Failed to sync photo:', error);
    }
  }
}

async function syncData() {
  // Sync any pending form data or updates
  console.log('Syncing pending data...');
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HardingHomesDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('photos')) {
        const photoStore = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
        photoStore.createIndex('jobId', 'jobId', { unique: false });
        photoStore.createIndex('synced', 'synced', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('jobs')) {
        db.createObjectStore('jobs', { keyPath: 'id' });
      }
    };
  });
}

function getAllPendingPhotos(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['photos'], 'readonly');
    const store = transaction.objectStore('photos');
    const index = store.index('synced');
    const request = index.getAll(false);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function markPhotoAsSynced(db, photoId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['photos'], 'readwrite');
    const store = transaction.objectStore('photos');
    const request = store.get(photoId);
    
    request.onsuccess = () => {
      const photo = request.result;
      photo.synced = true;
      const updateRequest = store.put(photo);
      updateRequest.onsuccess = () => resolve();
      updateRequest.onerror = () => reject(updateRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}

async function uploadPhoto(photo) {
  // This will be replaced with actual Supabase upload when backend is connected
  const formData = new FormData();
  formData.append('file', photo.file);
  formData.append('jobId', photo.jobId);
  
  const response = await fetch('/api/upload-photo', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Upload failed');
  }
  
  return response.json();
}