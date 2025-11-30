# Push Notifications (FCM + Web Push VAPID) Setup

## 🚀 Overview
Notifications now support two paths automatically:
- FCM (Firebase Cloud Messaging) where supported.
- Web Push (VAPID) fallback when FCM isn’t supported (e.g., Safari/iOS PWA, many desktop browsers).

Pressing “Send ‘Thinking of You’ Notification” will notify the partner via FCM or Web Push depending on their device capabilities.

## 📋 What You Need To Do

### 1) Generate VAPID keys (one-time)
You can use any of these methods:
- Use web-push CLI locally (recommended for accuracy):
  - In the `functions` folder: `npm i web-push`
  - Generate keys: `npx web-push generate-vapid-keys`
  - Save the output Public/Private keys.

### 2) Set environment/config values
- In root `.env` (used by the client):
```env
VITE_FIREBASE_VAPID_KEY=YOUR_VAPID_PUBLIC
FIREBASE_FUNCTIONS_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net
```

- In Firebase Functions config (used by Cloud Functions for Web Push):
```bash
firebase functions:config:set \
  webpush.public="YOUR_VAPID_PUBLIC" \
  webpush.private="YOUR_VAPID_PRIVATE" \
  webpush.email="you@example.com"
```

### 3) Install and deploy functions
In the `functions` directory:
```bash
npm install
npm install web-push --save
firebase deploy --only functions
```

### 4) Ensure the service worker is served
The Web Push service worker is at:
```
public/notification-sw.js
```
It must be accessible at `/notification-sw.js` on your domain (Vercel will serve from `public/`).

### 5) Firestore & Storage rules (confirm)
Deploy your existing rules:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```
No changes required for rules beyond what you already have in `firestore-rules-fixed.txt`. The app writes:
- `users/{uid}.fcmToken` (FCM path) and/or `users/{uid}.webPushSubscription` (Web Push path)
- `notifications` docs for triggering the server send

Your `users` rules already allow the user to update their own doc, so no change is needed for adding `webPushSubscription`.

## 🔧 How It Works
1) User taps “Enable Notifications”. The app tries:
   - FCM first (stores `fcmToken` in `users/{uid}`)
   - If unsupported, registers Web Push (stores `webPushSubscription` in `users/{uid}`) and uses `/notification-sw.js`.
2) User taps “Send ‘Thinking of You’ Notification”. The app writes a doc to `notifications`.
3) Cloud Function (`sendNotification`) triggers:
   - If `users/{toUserId}.fcmToken` exists → send via FCM
   - Else if `users/{toUserId}.webPushSubscription` exists → send via Web Push (VAPID)
4) If writing the Firestore doc fails, the client falls back to calling an HTTPS endpoint (`/api/send-thinking-of-you`) which relays to the function.

## 📱 Testing
Desktop (Chrome/Edge/Firefox):
1. Open the app, click “Enable Notifications”.
2. Approve the prompt.
3. Send a test notification.

iPhone (iOS 16.4+):
1. Open the site in Safari.
2. Add to Home Screen (PWA).
3. Open the PWA from the home screen, go to home tab, “Enable Notifications”.
4. Send a test notification. You should receive a lock-screen banner.

Notes for iOS:
- Push works only for PWAs added to Home Screen.
- Ensure the domain is HTTPS and the service worker is reachable at `/notification-sw.js`.

## 🛠 Troubleshooting
- Can’t enable notifications in Safari:
  - Confirm PWA is installed (Add to Home Screen), then enable inside the PWA.
- No notification received:
  - Check Functions logs in Firebase Console.
  - Confirm `users/{uid}` contains either `fcmToken` or `webPushSubscription`.
  - Verify VAPID keys are set via `firebase functions:config:get`.
- CORS or network errors when sending:
  - Set `FIREBASE_FUNCTIONS_URL` correctly in `.env`.
  - Ensure `/api/send-thinking-of-you` route exists in the deployed app and points to your functions URL.

## 📄 Files involved
- `public/notification-sw.js` — Web Push service worker
- `src/push.ts` — Client helpers to register/unregister Web Push and call HTTPS fallback
- `src/firebase/messaging.ts` — Now tries FCM first, falls back to Web Push
- `functions/index.js` — Sends via FCM or Web Push (VAPID). Also exposes `createThinkingOfYou` HTTPS endpoint
- `api/send-thinking-of-you.ts` — Vercel API route that forwards to the HTTPS function

## 🔒 Security
- `firestore-rules-fixed.txt` already allows:
  - users to update their own profile document (for saving tokens/subscriptions)
  - creating `notifications` docs by the authenticated sender
No additional rule changes required.

## ✅ Quick Command Reference
```bash
# in functions/
npm install
npm install web-push --save
firebase functions:config:set \
  webpush.public="YOUR_VAPID_PUBLIC" \
  webpush.private="YOUR_VAPID_PRIVATE" \
  webpush.email="you@example.com"
firebase deploy --only functions

# in project root (.env)
VITE_FIREBASE_VAPID_KEY=YOUR_VAPID_PUBLIC
FIREBASE_FUNCTIONS_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net

# deploy rules if you changed anything else
firebase deploy --only firestore:rules
```

You’re set. Once deployed, enable notifications per-user and start sending.
