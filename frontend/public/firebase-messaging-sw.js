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

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'FitFlow';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
