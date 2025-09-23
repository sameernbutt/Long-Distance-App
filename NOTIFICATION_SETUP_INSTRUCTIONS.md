# Push Notification Setup Instructions

## 🚀 Overview
I've implemented push notifications for your Long Distance App! When users click the "Send 'Thinking of You' Notification" button, it will send a push notification to their partner's iPhone home screen saying "[PARTNER_NAME] is thinking of you!"

## 📋 What You Need to Do

### 1. Firebase Console Setup

#### A. Enable Cloud Messaging
1. Go to your Firebase Console
2. Navigate to **Project Settings** → **Cloud Messaging**
3. Generate a **Server Key** (if you don't have one)
4. Generate a **Web Push Certificate** and get your **VAPID Key**

#### B. Update Configuration Files

**Add VAPID Key to your environment variables:**
Add this to your `.env` file:
```env
VITE_FIREBASE_VAPID_KEY=your-actual-vapid-key
```

**Update Service Worker:**
The service worker will be automatically generated with your environment variables during build. Just make sure your `.env` file has all the required Firebase config values:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-actual-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
VITE_FIREBASE_APP_ID=your-actual-app-id
VITE_FIREBASE_VAPID_KEY=your-actual-vapid-key
```

**Note:** The build process will automatically generate the service worker with your environment variables. The messaging service uses your existing Firebase config from `src/firebase/config.ts`!

### 2. Deploy Cloud Functions

#### A. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

#### B. Initialize Firebase Functions
```bash
cd functions
npm install
```

#### C. Deploy Functions
```bash
firebase deploy --only functions
```

### 3. Update Firestore Rules
Deploy the updated Firestore rules from `firestore-rules-fixed.txt`:
```bash
firebase deploy --only firestore:rules
```

### 4. Update User Schema
Add the `fcmToken` field to your user documents. The app will automatically store this when users enable notifications.

## 🔧 How It Works

### 1. User Flow
1. User clicks "Enable Notifications" button
2. Browser requests notification permission
3. If granted, FCM token is generated and stored in user's profile
4. User can now send "thinking of you" notifications to their partner

### 2. Notification Flow
1. User clicks "Send 'Thinking of You' Notification"
2. Notification data is stored in Firestore `notifications` collection
3. Cloud Function triggers automatically
4. Function retrieves partner's FCM token
5. Push notification is sent to partner's device
6. Partner sees notification on their iPhone home screen

### 3. Files Created/Modified

#### New Files:
- `public/firebase-messaging-sw.js` - Service worker for handling notifications
- `src/firebase/messaging.ts` - Firebase messaging service
- `functions/index.js` - Cloud Function for sending notifications
- `functions/package.json` - Dependencies for Cloud Functions

#### Modified Files:
- `src/App.tsx` - Added notification button and functionality
- `firestore-rules-fixed.txt` - Added rules for notifications collection

## 📱 Testing

### 1. Test on Desktop
1. Open your app in Chrome/Firefox
2. Click "Enable Notifications"
3. Allow notifications when prompted
4. Send a test notification to your partner

### 2. Test on iPhone
1. Open your app in Safari
2. Add to Home Screen (PWA)
3. Enable notifications
4. Test sending notifications

## 🛠 Troubleshooting

### Common Issues:

1. **"Notifications not working"**
   - Check if VAPID key is correct
   - Verify Firebase config matches your project
   - Ensure service worker is accessible at `/firebase-messaging-sw.js`

2. **"Permission denied"**
   - User needs to manually enable notifications in browser settings
   - On iPhone: Settings → Safari → Notifications → Allow

3. **"Cloud Function not triggering"**
   - Check Firebase Functions logs
   - Verify Firestore rules allow notification creation
   - Ensure functions are deployed

4. **"FCM token not generated"**
   - Check if service worker is properly registered
   - Verify VAPID key is correct
   - Check browser console for errors

## 🔒 Security Notes

- FCM tokens are stored in user profiles
- Only partners can send notifications to each other
- Notifications are stored in Firestore with proper security rules
- Cloud Functions handle the actual push notification sending

## 📈 Next Steps

Once this is working, you could enhance it by:
- Adding notification history
- Custom notification messages
- Notification preferences
- Read receipts
- Push notification analytics

## 🆘 Need Help?

If you run into issues:
1. Check the browser console for errors
2. Check Firebase Functions logs
3. Verify all configuration values are correct
4. Test with a simple notification first

The notification system is now fully integrated and ready to use once you complete the Firebase setup!
