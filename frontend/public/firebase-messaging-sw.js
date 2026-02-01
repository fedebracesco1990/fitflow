importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDYKyJU2Yz-BmrBLtZsp5GIXJ0a-ux61AI',
  authDomain: 'fitflow-84667.firebaseapp.com',
  projectId: 'fitflow-84667',
  storageBucket: 'fitflow-84667.firebasestorage.app',
  messagingSenderId: '763474285236',
  appId: '1:763474285236:web:60e2f6b65218cf0697bde1',
});

const messaging = firebase.messaging();

const DB_NAME = 'fitflow-notifications';
const DB_VERSION = 1;
const STORE_NAME = 'notifications';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

async function saveNotificationToIndexedDB(notification) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(notification);
    console.log('[SW] Notification saved to IndexedDB:', notification.id);
  } catch (error) {
    console.error('[SW] Failed to save notification:', error);
  }
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

messaging.onBackgroundMessage(async (payload) => {
  console.log('[SW] Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'FitFlow';
  const notificationBody = payload.notification?.body || '';
  // Use server timestamp as ID to match foreground listener and avoid duplicates
  const serverTimestamp = payload.data?.timestamp || Date.now().toString();
  
  const notification = {
    id: `notif-${serverTimestamp}`,
    title: notificationTitle,
    body: notificationBody,
    timestamp: new Date(parseInt(serverTimestamp)).toISOString(),
    read: false,
    data: payload.data || {},
  };
  
  await saveNotificationToIndexedDB(notification);
  
  const notificationOptions = {
    body: notificationBody,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: { ...payload.data, notificationId: notification.id },
    tag: notification.id,
    renotify: false, // Prevent re-showing if same tag exists
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
