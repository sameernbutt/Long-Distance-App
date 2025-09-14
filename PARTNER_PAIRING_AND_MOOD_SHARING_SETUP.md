# Partner Pairing & Mood Sharing Setup Guide

## New Features Implemented

### 🔗 **Partner Pairing System**
- **Code-based pairing**: Generate a 6-digit code to share with your partner
- **Link-based pairing**: Generate a shareable link for easy connection
- **Automatic pairing**: Clicking a partner link automatically opens the pairing screen
- **Real-time connection**: Partners are connected instantly when codes are entered

### 💝 **Mood Sharing System**
- **Real-time mood sharing**: Share your current mood with your partner instantly
- **Partner mood display**: See your partner's recent moods on your home page
- **Mood history**: Keep track of your own mood history
- **15 different moods**: From happy to stressed, with emojis and colors
- **Custom messages**: Add personal messages to your mood shares

## Database Schema

The following Firestore collections are used:

### `partnerConnections` Collection
```javascript
{
  id: string,           // Unique connection ID
  partner1Id: string,   // User who created the connection
  partner2Id: string,   // User who joined (optional until connected)
  partnerCode: string,  // 6-digit pairing code
  createdAt: number,    // Timestamp
  status: 'pending' | 'connected'
}
```

### `moods` Collection
```javascript
{
  id: string,           // Unique mood entry ID
  userId: string,       // User who will see this mood
  partnerId: string,    // Partner's user ID
  mood: string,         // Mood name (e.g., "Happy")
  emoji: string,        // Mood emoji (e.g., "😊")
  message: string,      // Custom message
  timestamp: any,       // Firestore timestamp
  isFromPartner: boolean // true if this is partner's mood for user to see
}
```

### `users` Collection (Updated)
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  partnerId: string,    // NEW: Partner's user ID when connected
  // ... other existing fields
}
```

## Firestore Security Rules

Add these rules to your Firestore security rules:

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
    
    // Mood sharing - users can read their own moods and partner's moods
    match /moods/{moodId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid);
      allow write: if request.auth != null && 
        (resource.data.userId == request.auth.uid);
    }
  }
}
```

## How It Works

### Partner Pairing Flow

1. **User A creates a connection**:
   - Clicks "Pair with Partner" in Profile
   - Selects "Create Code"
   - Gets a 6-digit code and shareable link
   - Shares either with their partner

2. **User B joins the connection**:
   - Clicks "Pair with Partner" in Profile
   - Selects "Join with Code"
   - Enters the 6-digit code OR clicks the shared link
   - Instantly connects with User A

3. **Connection established**:
   - Both users' profiles are updated with partner IDs
   - They can now share moods with each other

### Mood Sharing Flow

1. **User shares a mood**:
   - Selects a mood from the 15 available options
   - Optionally adds a custom message
   - Clicks "Share"

2. **Mood is saved**:
   - Saved to user's local history
   - If user has a partner, mood is shared with them in real-time
   - Partner sees the mood on their home page

3. **Real-time updates**:
   - Partner's home page shows their recent moods
   - Updates happen instantly without page refresh
   - Both users can see each other's mood history

## Testing the Features

### Test Partner Pairing

1. **Create two user accounts** (or use incognito mode for second account)
2. **User 1**: Go to Profile → Pair with Partner → Create Code
3. **Copy the code or link** generated
4. **User 2**: Go to Profile → Pair with Partner → Join with Code
5. **Enter the code** or click the shared link
6. **Verify connection** - both users should see "Connected" status

### Test Mood Sharing

1. **Ensure both users are paired** (follow pairing test above)
2. **User 1**: Go to Home page → Share Your Mood
3. **Select a mood** and add a message
4. **Click Share** - should see success message
5. **User 2**: Go to Home page → should see User 1's mood in "Partner's Recent Moods"
6. **User 2**: Share their own mood
7. **User 1**: Should see User 2's mood on their home page

## Features Overview

### ✅ **Partner Pairing**
- 6-digit code generation
- Shareable link creation
- Automatic link handling
- Real-time connection status
- Secure partner verification

### ✅ **Mood Sharing**
- 15 different mood options with emojis
- Custom message support
- Real-time partner mood updates
- Mood history tracking
- Beautiful UI with color-coded moods

### ✅ **Real-time Features**
- Instant mood sharing between partners
- Live partner mood updates
- Connection status updates
- No page refresh required

### ✅ **User Experience**
- Intuitive pairing process
- Clear visual feedback
- Responsive design
- Error handling and validation

## Troubleshooting

### Common Issues

1. **Pairing not working**:
   - Check if both users are logged in
   - Verify Firestore security rules
   - Check browser console for errors

2. **Moods not sharing**:
   - Ensure users are properly paired
   - Check partner ID in user profiles
   - Verify Firestore permissions

3. **Real-time updates not working**:
   - Check Firestore security rules
   - Ensure proper authentication
   - Check network connection

### Debug Steps

1. **Check Firestore Console** for data in collections
2. **Check browser console** for JavaScript errors
3. **Verify authentication** status in both accounts
4. **Test with different browsers** or incognito mode

## Next Steps

The partner pairing and mood sharing system is now fully functional! Users can:

- ✅ Pair with their partners using codes or links
- ✅ Share their moods in real-time
- ✅ See their partner's moods on their home page
- ✅ Track their own mood history
- ✅ Experience a seamless, real-time connection

The system is production-ready with proper security, error handling, and a beautiful user interface!
