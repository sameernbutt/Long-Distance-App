import { db } from './config';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

export interface ReunionData {
  coupleId: string;
  date: string;
  title: string;
  location: string;
  setBy: string;
  createdAt: number;
  updatedAt: number;
}

// Get couple reunion data
export const getCoupleReunion = async (userId: string, partnerId: string): Promise<ReunionData | null> => {
  try {
    const coupleId = [userId, partnerId].sort().join('_');
    const reunionDoc = await getDoc(doc(db, 'coupleReunions', coupleId));
    return reunionDoc.exists() ? reunionDoc.data() as ReunionData : null;
  } catch (error) {
    console.error('Error getting couple reunion:', error);
    return null;
  }
};

// Set couple reunion data
export const setCoupleReunion = async (
  userId: string, 
  partnerId: string, 
  reunionData: { date: string; title: string; location: string }
) => {
  try {
    const coupleId = [userId, partnerId].sort().join('_');
    const data: ReunionData = {
      coupleId,
      ...reunionData,
      setBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await setDoc(doc(db, 'coupleReunions', coupleId), data);
    return { success: true };
  } catch (error) {
    console.error('Error setting couple reunion:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Listen to couple reunion changes (real-time sync)
export const subscribeToReunionChanges = (
  userId: string, 
  partnerId: string, 
  callback: (reunion: ReunionData | null) => void
) => {
  const coupleId = [userId, partnerId].sort().join('_');
  const reunionRef = doc(db, 'coupleReunions', coupleId);
  
  return onSnapshot(reunionRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as ReunionData);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error listening to reunion changes:', error);
    callback(null);
  });
};