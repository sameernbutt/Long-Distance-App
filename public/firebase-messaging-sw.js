// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDSdiAOPsDdbHkdTY1XS0E8seyxFfWGvHI",
  authDomain: "long-distance-app-f43c7.firebaseapp.com",
  projectId: "long-distance-app-f43c7",
  storageBucket: "long-distance-app-f43c7.appspot.com",
  messagingSenderId: "248936017993",
  appId: "1:248936017993:web:4c1cb3accf43c4ffee0f98"
});

// Get Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages from FCM
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: 'thinking-of-you',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle Web Push messages (for iOS Safari)
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData = { title: 'New Message', body: 'You have a new notification' };
    }
  } else {
    notificationData = { title: 'Thinking of You! ❤️', body: 'Someone is thinking of you!' };
  }
  
  const notificationTitle = notificationData.title || 'Thinking of You! ❤️';
  const notificationOptions = {
    body: notificationData.body || 'Someone is thinking of you!',
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: 'thinking-of-you',
    requireInteraction: true,
    data: notificationData.data || {},
    actions: [
      {
        action: 'open',
        title: 'Open App'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
