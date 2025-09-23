import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables
const envFile = path.join(__dirname, '..', '.env');
let envVars = {};

if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
}

// Generate service worker content
const swContent = `// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "${envVars.VITE_FIREBASE_API_KEY || 'your-api-key-here'}",
  authDomain: "${envVars.VITE_FIREBASE_AUTH_DOMAIN || 'your-project-id.firebaseapp.com'}",
  projectId: "${envVars.VITE_FIREBASE_PROJECT_ID || 'your-project-id'}",
  storageBucket: "${envVars.VITE_FIREBASE_STORAGE_BUCKET || 'your-project-id.appspot.com'}",
  messagingSenderId: "${envVars.VITE_FIREBASE_MESSAGING_SENDER_ID || 'your-sender-id'}",
  appId: "${envVars.VITE_FIREBASE_APP_ID || 'your-app-id'}"
});

// Get Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages
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
`;

// Write the service worker file
const swPath = path.join(__dirname, '..', 'public', 'firebase-messaging-sw.js');
fs.writeFileSync(swPath, swContent);

console.log('Service worker generated successfully with environment variables');
