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

// FCM background handler — only shows native OS notification.
// In-app notifications are handled by the backend API + WebSocket.
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'FitFlow';
  const notificationBody = payload.notification?.body || '';
  const tag = payload.data?.timestamp || Date.now().toString();

  const notificationOptions = {
    body: notificationBody,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: payload.data || {},
    tag: `notif-${tag}`,
    renotify: false,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
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
