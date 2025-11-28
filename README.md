# Lovespark 💕

<div align="center">

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12.2.1-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7.1.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**A full-stack Progressive Web App (PWA) designed to help long-distance couples stay connected through real-time features, interactive activities, and shared experiences.**

[Live Demo](#) • [Features](#-key-features) • [Tech Stack](#-technical-stack) • [Architecture](#-architecture) • [Getting Started](#-getting-started)

</div>

---

## 📖 Overview

Lovespark is a **mobile-first Progressive Web App** built to address the unique challenges of long-distance relationships. The application provides couples with real-time communication tools, shared activities, and collaborative planning features—all synchronized instantly between partners using Firebase's real-time database.

### 🎯 Problem Statement
Long-distance couples often struggle to maintain connection and shared experiences across time zones and physical distance. Traditional messaging apps lack the intimacy and purposeful engagement that relationships need to thrive.

### 💡 Solution
Lovespark creates a dedicated digital space for couples with features specifically designed to foster emotional connection, including mood sharing, daily conversation prompts, virtual date planning, and shared media feeds.

---

## ✨ Key Features

### 🔐 Authentication & Partner Pairing
- **Multi-provider authentication** (Email/Password + Google OAuth)
- **Secure partner pairing system** using unique shareable codes
- **Real-time connection status** with visual indicators
- **Role-based access control** through Firestore security rules

### 💭 Real-Time Mood Sharing
- **Instant mood synchronization** between partners using Firestore listeners
- **12 mood options** with emoji indicators and color-coded UI
- **Side-by-side mood display** showing both partners' current states
- **Persistent mood history** for relationship insights

### 📝 Daily Questions System
- **Globally synchronized questions** ensuring partners receive the same prompt
- **Deterministic question rotation** based on date algorithms
- **Side-by-side answer display** once both partners respond
- **CSV-based question bank** for easy content management

### 🎮 Interactive Games
- **Would You Rather** - Relationship-focused dilemmas
- **Truth or Dare** - Couples edition with custom prompts
- **CSV parsing** for dynamic game content loading
- **Game history tracking** for session continuity

### 📸 Shared Media Feed
- **Photo & video sharing** with Firebase Storage (10MB limit)
- **Spotify music link sharing** with embedded previews
- **Real-time feed updates** using Firestore subscriptions
- **Emoji reactions** and comment threads on shared content

### 📅 Date Planning & Bucket List
- **Curated virtual date ideas** categorized by type
- **Shared bucket list** with real-time synchronization
- **Date night countdown timers** with scheduling
- **Custom activity creation** beyond suggested ideas

### 🔔 Push Notifications
- **"Thinking of You" notifications** sent between partners
- **Firebase Cloud Messaging (FCM)** integration
- **Web Push API fallback** with VAPID authentication
- **Firebase Cloud Functions** for serverless notification delivery

### 🌙 Dark Mode
- **System-preference detection** with manual toggle
- **Persistent theme preference** in user profile
- **Consistent theming** across all components
- **Accessible color contrast** in both modes

---

## 🛠 Technical Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18.3** | Component-based UI with hooks |
| **TypeScript 5.5** | Type safety and developer experience |
| **Vite 7.1** | Fast build tool with HMR |
| **Tailwind CSS 3.4** | Utility-first responsive styling |
| **Lucide React** | Consistent iconography |

### Backend & Services
| Technology | Purpose |
|------------|---------|
| **Firebase Auth** | Multi-provider authentication |
| **Cloud Firestore** | Real-time NoSQL database |
| **Firebase Storage** | Media file storage |
| **Firebase Cloud Functions** | Serverless backend logic |
| **Firebase Cloud Messaging** | Push notification delivery |

### Development Tools
| Tool | Purpose |
|------|---------|
| **ESLint 9** | Code linting with React hooks rules |
| **PostCSS + Autoprefixer** | CSS processing |
| **TypeScript ESLint** | TypeScript-specific linting |

---

## 🏗 Architecture

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Client (PWA)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   React     │  │  Firebase   │  │    Service Worker   │  │
│  │ Components  │◄─┤    SDK      │  │   (Offline/Push)    │  │
│  └─────────────┘  └──────┬──────┘  └─────────────────────┘  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Backend                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
│  │   Auth    │  │ Firestore │  │  Storage  │  │   FCM    │ │
│  └───────────┘  └───────────┘  └───────────┘  └──────────┘ │
│                         │                                    │
│                         ▼                                    │
│              ┌─────────────────────┐                        │
│              │  Cloud Functions    │                        │
│              │  (Notification API) │                        │
│              └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema (Firestore Collections)

```
├── users/
│   └── {userId}
│       ├── displayName: string
│       ├── email: string
│       ├── partnerId: string
│       ├── fcmToken: string
│       └── darkMode: boolean
│
├── partnerConnections/
│   └── {connectionId}
│       ├── partner1Id: string
│       ├── partner2Id: string
│       ├── partnerCode: string
│       └── status: 'pending' | 'connected'
│
├── moods/
│   └── {moodId}
│       ├── userId: string
│       ├── moodId: string
│       └── timestamp: Timestamp
│
├── feed/
│   └── {itemId}
│       ├── userId: string
│       ├── type: 'photo' | 'video' | 'music'
│       ├── content: string
│       ├── reactions: Map
│       └── comments: Array
│
├── bucketList/
│   └── {itemId}
│       ├── title: string
│       ├── createdBy: string
│       └── coupleId: string
│
├── coupleDateNights/
│   └── {coupleId}
│       ├── activity: string
│       ├── dateTime: Timestamp
│       └── createdBy: string
│
└── dailyAnswers/
    └── {answerId}
        ├── userId: string
        ├── question: string
        ├── answer: string
        └── date: string
```

### Security Rules Highlights
```javascript
// Partner-based access control
match /moods/{moodId} {
  allow read: if isOwner() || isPartner();
  allow write: if isOwner();
}

// Secure partner pairing flow
match /partnerConnections/{connectionId} {
  allow create: if request.auth.uid == request.resource.data.partner1Id;
  allow update: if isPendingConnection() || isConnectionMember();
}
```

---

## 📱 PWA Features

- **Installable** - Add to home screen on mobile devices
- **Offline Support** - Service worker caching for core functionality
- **Push Notifications** - Background notification delivery
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Portrait Lock** - Optimized mobile experience

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore, Auth, Storage, and FCM enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/sameernbutt/Long-Distance-App.git
cd Long-Distance-App

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Firebase configuration

# Start development server
npm run dev
```

### Environment Variables
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Build & Deploy
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy Firebase services
firebase deploy
```

---

## 📂 Project Structure

```
src/
├── components/           # React components
│   ├── CameraInterface.tsx
│   ├── DailyQuestions.tsx
│   ├── DateNightCountdown.tsx
│   ├── FeedList.tsx
│   ├── Games.tsx
│   ├── MoodSharing.tsx
│   ├── PartnerPairing.tsx
│   ├── Profile.tsx
│   └── VirtualDates.tsx
├── contexts/
│   └── AuthContext.tsx   # Authentication state management
├── firebase/
│   ├── auth.ts           # Authentication utilities
│   ├── config.ts         # Firebase initialization
│   ├── dailyQuestions.ts # Daily questions logic
│   ├── dates.ts          # Date planning utilities
│   ├── feed.ts           # Feed CRUD operations
│   ├── messaging.ts      # Push notification setup
│   ├── moods.ts          # Mood sharing utilities
│   └── partners.ts       # Partner pairing logic
├── App.tsx               # Main application component
└── main.tsx              # Application entry point

functions/
└── src/
    └── index.ts          # Cloud Functions (notifications)

public/
├── firebase-messaging-sw.js  # FCM service worker
├── manifest.json             # PWA manifest
└── resources/                # CSV data files
```

---

## 🎓 Skills Demonstrated

- **Full-Stack Development** - End-to-end feature implementation
- **Real-Time Systems** - Firestore listeners and live synchronization
- **Authentication & Security** - Multi-provider auth with role-based access
- **Cloud Functions** - Serverless backend with Firebase Functions
- **Push Notifications** - FCM and Web Push API integration
- **State Management** - React Context for global state
- **TypeScript** - Type-safe development practices
- **Responsive Design** - Mobile-first Tailwind CSS styling
- **PWA Development** - Service workers, manifest, offline support

---

## 📄 License

This project is private and not licensed for public use.

---

<div align="center">

**Built with ❤️ for couples everywhere**

</div>