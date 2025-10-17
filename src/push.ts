import { db } from './firebase/config';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export async function registerWebPush(userId: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Web Push not supported in this browser');
  }

  // Register service worker
  const registration = await navigator.serviceWorker.register('/notification-sw.js');

  // Ask Notification permission first
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission denied');
  }

  // Subscribe to push
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  // Save subscription in Firestore under user
  const usersRef = doc(db, 'users', userId);
  await setDoc(usersRef, { webPushSubscription: subscription.toJSON() }, { merge: true });
  return subscription.toJSON();
}

export async function unregisterWebPush(userId: string) {
  const registration = await navigator.serviceWorker.getRegistration('/notification-sw.js');
  if (!registration) return;
  const sub = await registration.pushManager.getSubscription();
  if (sub) await sub.unsubscribe();
  const usersRef = doc(db, 'users', userId);
  await updateDoc(usersRef, { webPushSubscription: null });
}

export async function sendWebPushThinkingOfYou(
  fromUserId: string,
  toUserId: string,
  fromUserName: string
) {
  // Create a notification document to trigger the existing function
  const res = await fetch('/api/send-thinking-of-you', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromUserId, toUserId, fromUserName }),
  });
  const json = await res.json();
  return json;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


