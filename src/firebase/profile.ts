import { db } from './config';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  displayName: string;
  location: string;
  email?: string;
  photoURL?: string;
}

export interface CoupleAnniversary {
  coupleId: string;
  anniversaryDate: string;
  setBy: string;
  createdAt: number;
  updatedAt: number;
}

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data() as UserProfile : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    await updateDoc(doc(db, 'users', userId), updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get couple anniversary
export const getCoupleAnniversary = async (userId: string, partnerId: string): Promise<CoupleAnniversary | null> => {
  try {
    // Create consistent couple ID (sorted to ensure same ID regardless of who queries)
    const coupleId = [userId, partnerId].sort().join('_');
    const anniversaryDoc = await getDoc(doc(db, 'coupleAnniversaries', coupleId));
    return anniversaryDoc.exists() ? anniversaryDoc.data() as CoupleAnniversary : null;
  } catch (error) {
    console.error('Error getting couple anniversary:', error);
    return null;
  }
};

// Set couple anniversary
export const setCoupleAnniversary = async (userId: string, partnerId: string, anniversaryDate: string) => {
  try {
    const coupleId = [userId, partnerId].sort().join('_');
    const anniversaryData: CoupleAnniversary = {
      coupleId,
      anniversaryDate,
      setBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await setDoc(doc(db, 'coupleAnniversaries', coupleId), anniversaryData);
    return { success: true };
  } catch (error) {
    console.error('Error setting couple anniversary:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Calculate relationship duration
export const calculateRelationshipDuration = (anniversaryDate: string) => {
  const anniversary = new Date(anniversaryDate);
  const now = new Date();
  
  let years = now.getFullYear() - anniversary.getFullYear();
  let months = now.getMonth() - anniversary.getMonth();
  let days = now.getDate() - anniversary.getDate();
  
  if (days < 0) {
    months--;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  return { years, months, days };
};

// Delete user account
export const deleteUserAccount = async (userId: string) => {
  try {
    // Note: This only removes Firestore data
    // Firebase Auth account deletion needs to be handled client-side
    
    // Remove user from users collection
    await updateDoc(doc(db, 'users', userId), { 
      deleted: true, 
      deletedAt: Date.now(),
      displayName: '[Deleted User]'
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user account:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};