# Firebase Setup Guide

To enable authentication and real-time features, you need to set up a Firebase project.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: "Together Apart" (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password**: Click "Email/Password" → Enable → Save
   - **Google**: Click "Google" → Enable → Add your project support email → Save

## 3. Create Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

## 4. Enable Storage

1. Go to "Storage" in the left sidebar
2. Click "Get started"
3. Choose "Start in test mode" (for development)
4. Select the same location as Firestore
5. Click "Done"

## 5. Get Firebase Configuration

1. Go to Project Settings (gear icon) → "General" tab
2. Scroll down to "Your apps" section
3. Click "Web" icon (</>) to add a web app
4. Enter app nickname: "Together Apart Web"
5. Check "Also set up Firebase Hosting" (optional)
6. Click "Register app"
7. Copy the Firebase configuration object

## 6. Update Firebase Config

Replace the placeholder values in `src/firebase/config.ts` with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## 7. Set Up Security Rules (Important!)

### Firestore Rules
Go to Firestore Database → Rules tab and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Partner connections - users can read/write their own connections
    match /partnerConnections/{connectionId} {
      allow read, write: if request.auth != null && 
        (resource.data.partner1Id == request.auth.uid || 
         resource.data.partner2Id == request.auth.uid);
    }
    
    // Feed items - users can read their own and partner's items
    match /feed/{itemId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.uid in resource.data.likes);
      allow write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.uid == request.resource.data.userId);
    }
    
    // Custom dates - users can read their own and partner's dates
    match /customDates/{dateId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.uid == request.resource.data.userId);
    }
    
    // Bucket list - users can read their own and partner's items
    match /bucketList/{itemId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.uid == request.resource.data.userId);
    }
  }
}
```

### Storage Rules
Go to Storage → Rules tab and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload and manage their own files
    match /feed/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 8. Test the Setup

1. Run your app: `npm run dev`
2. Try creating an account with email/password
3. Try signing in with Google
4. Test the partner pairing functionality

## 9. Production Considerations

Before going live:

1. **Update Security Rules**: Make them more restrictive for production
2. **Enable App Check**: Add app verification
3. **Set up Monitoring**: Enable Firebase Performance Monitoring
4. **Configure Hosting**: Deploy to Firebase Hosting for better performance
5. **Set up Analytics**: Track user engagement

## Troubleshooting

- **Authentication not working**: Check if the providers are enabled in Firebase Console
- **Database permission denied**: Verify Firestore rules are correct
- **Storage upload fails**: Check Storage rules and file size limits
- **CORS errors**: Make sure your domain is added to authorized domains in Firebase

## Support

If you encounter issues:
1. Check the Firebase Console for error logs
2. Check browser console for detailed error messages
3. Verify all configuration values are correct
4. Ensure all required services are enabled
