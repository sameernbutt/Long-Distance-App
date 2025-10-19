import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { registerWebPush } from '../push';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { app, db, auth } from './config';

// Initialize Firebase Messaging
const messaging = getMessaging(app);

// VAPID key for push notifications (get this from Firebase Console)
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'your-vapid-key';

export interface NotificationData {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  message: string;
  timestamp: number;
  read: boolean;
}

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    console.log('Starting notification permission request...');
    
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return null;
    }

    // Check if we're on iOS Safari and if the app is running as PWA
    const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|OPiOS|mercury/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;

    console.log('Browser detection:', { isIOSSafari, isStandalone });

    if (isIOSSafari && !isStandalone) {
      console.warn('iOS Safari requires the app to be installed as PWA for notifications');
      return null;
    }

    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log('Permission result:', permission);
    
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // Try FCM first (works on most browsers)
    console.log('Attempting FCM token...');
    try {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token) {
        const user = auth.currentUser;
        if (user) {
          await updateDoc(doc(db, 'users', user.uid), { fcmToken: token });
        }
        console.log('FCM token obtained successfully');
        return token;
      }
    } catch (e) {
      console.warn('FCM unsupported or failed, trying Web Push:', e);
    }

    // Fallback to Web Push (especially for iOS Safari)
    console.log('Attempting Web Push subscription...');
    try {
      const user = auth.currentUser;
      if (user) {
        const subscription = await registerWebPush(user.uid);
        console.log('Web Push subscription created successfully');
        return 'webpush';
      }
    } catch (e) {
      console.warn('Web Push also failed:', e);
    }

    console.log('All notification methods failed');
    return null;
  } catch (error) {
    console.error('An error occurred while enabling notifications:', error);
    return null;
  }
};

// Send a "thinking of you" notification to partner
export const sendThinkingOfYouNotification = async (
  fromUserId: string,
  toUserId: string,
  fromUserName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Store notification in Firestore (trigger function to send via FCM or Web Push)
    const notificationData: Omit<NotificationData, 'id'> = {
      fromUserId,
      toUserId,
      fromUserName,
      message: `${fromUserName} is thinking of you!`,
      timestamp: Date.now(),
      read: false
    };

    await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      createdAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending notification via Firestore:', error);
    // Fallback to HTTPS endpoint
    try {
      const res = await fetch('/api/send-thinking-of-you', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId, toUserId, fromUserName })
      });
      const json = await res.json();
      return json;
    } catch (e: any) {
      return { success: false, error: e.message || 'Unknown error' };
    }
  }
};

// Listen for foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      resolve(payload);
    });
  });
};

// Get user's FCM token
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};
