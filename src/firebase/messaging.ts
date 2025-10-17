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
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    try {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token) {
        const user = auth.currentUser;
        if (user) {
          await updateDoc(doc(db, 'users', user.uid), { fcmToken: token });
        }
        return token;
      }
    } catch (e) {
      console.warn('FCM unsupported or failed, trying Web Push:', e);
      const user = auth.currentUser;
      if (user) {
        await registerWebPush(user.uid);
        return 'webpush';
      }
    }
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
