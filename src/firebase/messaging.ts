import { getMessaging, getToken, onMessage } from 'firebase/messaging';
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
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });
      
      if (token) {
        console.log('FCM Token:', token);
        
        // Store the token in the user's profile
        const user = auth.currentUser;
        if (user) {
          try {
            await updateDoc(doc(db, 'users', user.uid), {
              fcmToken: token
            });
            console.log('FCM token stored in user profile');
          } catch (error) {
            console.error('Error storing FCM token:', error);
          }
        }
        
        return token;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } else {
      console.log('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
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
    // Store notification in Firestore
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

    // In a real implementation, you would call a Cloud Function here
    // that would send the push notification to the partner's device
    // For now, we'll just store it in Firestore
    
    return { success: true };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
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
