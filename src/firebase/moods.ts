import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

export interface MoodEntry {
  id: string;
  userId: string;
  partnerId: string;
  mood: string;
  emoji: string;
  message: string;
  timestamp: any;
  isFromPartner: boolean;
}

// Share a mood with partner
export const shareMood = async (
  userId: string, 
  partnerId: string, 
  mood: string, 
  emoji: string, 
  message: string
) => {
  try {
    // Add mood entry for the user
    const moodEntry = {
      userId,
      partnerId,
      mood,
      emoji,
      message,
      timestamp: serverTimestamp(),
      isFromPartner: false
    };
    
    const docRef = await addDoc(collection(db, 'moods'), moodEntry);
    
    // Add mood entry for the partner (so they can see it)
    const partnerMoodEntry = {
      userId: partnerId,
      partnerId: userId,
      mood,
      emoji,
      message,
      timestamp: serverTimestamp(),
      isFromPartner: true
    };
    
    await addDoc(collection(db, 'moods'), partnerMoodEntry);
    
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Get mood history for a user
export const getMoodHistory = async (userId: string, limitCount: number = 10) => {
  try {
    const moodsRef = collection(db, 'moods');
    const q = query(
      moodsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const moods: MoodEntry[] = [];
    
    querySnapshot.forEach((doc) => {
      moods.push({ id: doc.id, ...doc.data() } as MoodEntry);
    });
    
    return { moods, error: null };
  } catch (error: any) {
    return { moods: [], error: error.message };
  }
};

// Get partner's current mood (most recent)
export const getPartnerMoods = async (userId: string, limitCount: number = 1) => {
  try {
    const moodsRef = collection(db, 'moods');
    const q = query(
      moodsRef,
      where('userId', '==', userId),
      where('isFromPartner', '==', true),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const moods: MoodEntry[] = [];
    
    querySnapshot.forEach((doc) => {
      moods.push({ id: doc.id, ...doc.data() } as MoodEntry);
    });
    
    return { moods, error: null };
  } catch (error: any) {
    return { moods: [], error: error.message };
  }
};

// Real-time listener for partner's current mood
export const subscribeToPartnerMoods = (
  userId: string, 
  callback: (moods: MoodEntry[]) => void
) => {
  const moodsRef = collection(db, 'moods');
  const q = query(
    moodsRef,
    where('userId', '==', userId),
    where('isFromPartner', '==', true),
    orderBy('timestamp', 'desc'),
    limit(1)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const moods: MoodEntry[] = [];
    querySnapshot.forEach((doc) => {
      moods.push({ id: doc.id, ...doc.data() } as MoodEntry);
    });
    callback(moods);
  });
};

// Get user's partner ID
export const getPartnerId = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.partnerId || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting partner ID:', error);
    return null;
  }
};
