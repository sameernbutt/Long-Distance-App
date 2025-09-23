const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Cloud Function to send push notifications
exports.sendNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    
    try {
      // Get the recipient's FCM token from their user document
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(notification.toUserId)
        .get();
      
      if (!userDoc.exists) {
        console.log('User not found:', notification.toUserId);
        return null;
      }
      
      const userData = userDoc.data();
      const fcmToken = userData.fcmToken;
      
      if (!fcmToken) {
        console.log('No FCM token for user:', notification.toUserId);
        return null;
      }
      
      // Create the notification payload
      const payload = {
        notification: {
          title: notification.fromUserName,
          body: notification.message,
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
        },
        data: {
          notificationId: context.params.notificationId,
          fromUserId: notification.fromUserId,
          fromUserName: notification.fromUserName
        },
        token: fcmToken
      };
      
      // Send the notification
      const response = await admin.messaging().send(payload);
      console.log('Successfully sent message:', response);
      
      return response;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  });

// Function to update user's FCM token
exports.updateFCMToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { fcmToken } = data;
  const userId = context.auth.uid;
  
  try {
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .update({ fcmToken });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating FCM token:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update FCM token');
  }
});
