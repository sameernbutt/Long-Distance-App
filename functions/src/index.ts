import { setGlobalOptions } from "firebase-functions/v2";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import * as webpush from "web-push";
import * as functionsConfig from "firebase-functions";

setGlobalOptions({ maxInstances: 10, region: "us-central1" });

admin.initializeApp();

// Helper to send via FCM or Web Push (VAPID)
async function sendThinking(toUserId: string, fromUserName: string) {
  const userSnap = await admin.firestore().collection('users').doc(toUserId).get();
  if (!userSnap.exists) {
    logger.warn("User not found", { toUserId });
    return;
  }
  const userData = userSnap.data() || {} as any;
  const fcmToken: string | undefined = userData.fcmToken;
  const webPushSubscription: any = userData.webPushSubscription;

  if (fcmToken) {
    const payload = {
      notification: {
        title: 'Thinking of You! ❤️',
        body: `${fromUserName} is thinking of you!`,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-96.png',
      },
      token: fcmToken,
    } as any;
    await admin.messaging().send(payload);
    logger.info('Sent via FCM', { toUserId });
    return;
  }

  if (webPushSubscription) {
    const cfg = functionsConfig.config();
    const vapidPublic = cfg?.webpush?.public;
    const vapidPrivate = cfg?.webpush?.private;
    const vapidEmail = cfg?.webpush?.email;
    if (!vapidPublic || !vapidPrivate || !vapidEmail) {
      logger.error('Missing webpush VAPID config');
      return;
    }
    webpush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublic, vapidPrivate);
    const payload = JSON.stringify({
      title: 'Thinking of You! ❤️',
      body: `${fromUserName} is thinking of you!`,
      data: { url: '/' },
    });
    await webpush.sendNotification(webPushSubscription, payload);
    logger.info('Sent via Web Push', { toUserId });
    return;
  }

  logger.warn('No delivery method (FCM/WebPush) for user', { toUserId });
}

// Firestore trigger when a notification doc is created
export const sendNotification = onDocumentCreated("notifications/{notificationId}", async (event) => {
  const doc = event.data;
  if (!doc) return;
  const data = doc.data() as any;
  const toUserId: string = data.toUserId;
  const fromUserName: string = data.fromUserName;
  await sendThinking(toUserId, fromUserName);
});

// HTTPS fallback endpoint to create a notification
export const createThinkingOfYou = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  try {
    const { fromUserId, toUserId, fromUserName } = req.body || {};
    if (!fromUserId || !toUserId || !fromUserName) {
      res.status(400).json({ success: false, error: 'Missing fields' });
      return;
    }
    await admin.firestore().collection('notifications').add({
      fromUserId,
      toUserId,
      fromUserName,
      createdAt: Date.now(),
    });
    res.json({ success: true });
  } catch (e: any) {
    logger.error('createThinkingOfYou failed', e);
    res.status(500).json({ success: false, error: String(e) });
  }
});
