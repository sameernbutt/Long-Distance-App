const functions = require('firebase-functions');
const admin = require('firebase-admin');
const webpush = require('web-push');

admin.initializeApp();

// Cloud Function to send push notifications
exports.sendNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    const toUserId = notification.toUserId;
    const fromUserName = notification.fromUserName;

    try {
      const userDoc = await admin.firestore().collection('users').doc(toUserId).get();
      if (!userDoc.exists) {
        console.log('User not found:', toUserId);
        return null;
      }
      const userData = userDoc.data() || {};
      const fcmToken = userData.fcmToken;
      const webPushSub = userData.webPushSubscription;

      if (fcmToken) {
        const payload = {
          notification: {
            title: 'Thinking of You! ❤️',
            body: `${fromUserName} is thinking of you!`,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-96.png',
          },
          token: fcmToken,
        };
        const response = await admin.messaging().send(payload);
        console.log('FCM sent:', response);
        return response;
      } else if (webPushSub) {
        const vapidPublic = functions.config().webpush && functions.config().webpush.public;
        const vapidPrivate = functions.config().webpush && functions.config().webpush.private;
        const vapidEmail = functions.config().webpush && functions.config().webpush.email;
        if (!vapidPublic || !vapidPrivate || !vapidEmail) {
          console.error('Missing webpush VAPID config. Set functions config webpush.public, webpush.private, webpush.email');
          return null;
        }
        webpush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublic, vapidPrivate);
        const payload = JSON.stringify({
          title: 'Thinking of You! ❤️',
          body: `${fromUserName} is thinking of you!`,
          data: { url: '/' },
        });
        await webpush.sendNotification(webPushSub, payload);
        console.log('Web Push sent');
        return null;
      } else {
        console.log('No FCM token or Web Push subscription for:', toUserId);
        return null;
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  });

// HTTPS endpoint to create a notification doc from the app (works on Vercel)
exports.createThinkingOfYou = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  try {
    const { fromUserId, toUserId, fromUserName } = req.body || {};
    if (!fromUserId || !toUserId || !fromUserName) {
      return res.status(400).json({ success: false, error: 'Missing fields' });
    }
    await admin.firestore().collection('notifications').add({
      fromUserId,
      toUserId,
      fromUserName,
      createdAt: Date.now(),
    });
    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: String(e) });
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
