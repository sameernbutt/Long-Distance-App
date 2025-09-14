# Firebase Setup Instructions

## Quick Setup for Authentication

To get the login functionality working, you need to set up a Firebase project and configure it with your app.

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: "Long Distance App" (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password**: Click "Email/Password" → Enable → Save
   - **Google**: Click "Google" → Enable → Add your project support email → Save

### Step 3: Create Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

### Step 4: Get Firebase Configuration

1. Go to Project Settings (gear icon) → "General" tab
2. Scroll down to "Your apps" section
3. Click "Web" icon (</>) to add a web app
4. Enter app nickname: "Long Distance App Web"
5. Click "Register app"
6. Copy the Firebase configuration object

### Step 5: Create Environment File

Create a `.env` file in your project root with the following content:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-actual-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
VITE_FIREBASE_APP_ID=your-actual-app-id
```

Replace the placeholder values with your actual Firebase configuration values.

### Step 6: Set Up Security Rules

#### Firestore Rules
Go to Firestore Database → Rules tab and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 7: Test the Setup

1. Run your app: `npm run dev`
2. Try creating an account with email/password
3. Try signing in with the created account
4. Test the Google sign-in functionality

## Security Features Implemented

✅ **Password Hashing**: Firebase Authentication automatically handles secure password hashing using industry-standard methods (bcrypt, scrypt, etc.)

✅ **Email Verification**: Firebase can send verification emails (optional to enable)

✅ **Secure Authentication**: All authentication is handled server-side by Firebase

✅ **Error Handling**: Comprehensive error messages for different authentication scenarios

✅ **User Profiles**: User data is stored securely in Firestore with proper security rules

## What's Working Now

- User registration with email and password
- User login with email and password  
- Google sign-in
- Secure password storage (hashed by Firebase)
- User profile creation and storage
- Proper error handling and user feedback
- Authentication state management

## Next Steps

Once you've completed the Firebase setup:

1. Test the authentication flow
2. Users can create accounts and sign in
3. User data is securely stored in Firestore
4. You can extend the app with additional features

The authentication system is now production-ready with proper security measures in place!
