import { auth, db } from './config';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  partnerId?: string;
  partnerCode?: string;
  createdAt: number;
}

// Mock authentication functions that work without Firebase API keys

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await auth.signInWithEmailAndPassword(email, password);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const result = await auth.createUserWithEmailAndPassword(email, password);
    
    // Create user profile in mock database
    const userProfile: UserProfile = {
      uid: result.user.uid,
      email: result.user.email!,
      displayName,
      createdAt: Date.now()
    };
    
    await db.collection('users').doc(result.user.uid).set(userProfile);
    
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Sign in with Google (mocked)
export const signInWithGoogle = async () => {
  try {
    const result = await auth.signInWithPopup(auth.googleProvider);
    
    // Create or update user profile
    const userProfile: UserProfile = {
      uid: result.user.uid,
      email: result.user.email!,
      displayName: result.user.displayName || 'User',
      photoURL: result.user.photoURL || undefined,
      createdAt: Date.now()
    };
    
    await db.collection('users').doc(result.user.uid).set(userProfile);
    
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await auth.signOut();
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Generate partner code
export const generatePartnerCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};