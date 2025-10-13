import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { db } from './config';

export interface DateIdea {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  time: string;
  icon: string;
  isCustom: boolean;
  likes: string[]; // Array of user IDs who liked
  createdAt: number;
}

export interface BucketListItem {
  id: string;
  userId: string;
  userName: string;
  title: string;
  completed: boolean;
  completedAt?: number;
  createdAt: number;
}

// Add custom date idea
export const addCustomDateIdea = async (
  userId: string,
  userName: string,
  title: string,
  description: string,
  category: string,
  difficulty: string,
  time: string,
  icon: string
) => {
  try {
    const dateIdea: Omit<DateIdea, 'id'> = {
      userId,
      userName,
      title,
      description,
      category,
      difficulty,
      time,
      icon,
      isCustom: true,
      likes: [],
      createdAt: Date.now()
    };
    
    const docRef = await addDoc(collection(db, 'customDates'), dateIdea);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

// Get shared date ideas (both partners' custom dates)
export const getSharedDateIdeas = async (userId: string, partnerId: string) => {
  try {
    const datesRef = collection(db, 'customDates');
    const q = query(
      datesRef,
      where('userId', 'in', [userId, partnerId]),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const ideas: DateIdea[] = [];
    
    querySnapshot.forEach((doc) => {
      ideas.push({ id: doc.id, ...doc.data() } as DateIdea);
    });
    
    return { ideas, error: null };
  } catch (error: any) {
    return { ideas: [], error: error.message };
  }
};

// Like/unlike date idea
export const toggleDateLike = async (dateId: string, userId: string, isLiked: boolean) => {
  try {
    const dateRef = doc(db, 'customDates', dateId);
    
    if (isLiked) {
      await updateDoc(dateRef, {
        likes: arrayRemove(userId)
      });
    } else {
      await updateDoc(dateRef, {
        likes: arrayUnion(userId)
      });
    }
    
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Update date idea
export const updateDateIdea = async (
  dateId: string,
  userId: string,
  updates: Partial<Pick<DateIdea, 'title' | 'description' | 'category' | 'difficulty' | 'time'>>
) => {
  try {
    const dateRef = doc(db, 'customDates', dateId);
    
    // Check if user owns this date idea
    const dateDoc = await getDoc(dateRef);
    if (dateDoc.exists()) {
      const date = dateDoc.data() as DateIdea;
      if (date.userId === userId) {
        await updateDoc(dateRef, updates);
        return { error: null };
      } else {
        return { error: 'Not authorized to edit this date idea' };
      }
    }
    
    return { error: 'Date idea not found' };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Delete date idea
export const deleteDateIdea = async (dateId: string, userId: string) => {
  try {
    const dateRef = doc(db, 'customDates', dateId);
    
    // Check if user owns this date idea
    const dateDoc = await getDoc(dateRef);
    if (dateDoc.exists()) {
      const date = dateDoc.data() as DateIdea;
      if (date.userId === userId) {
        await deleteDoc(dateRef);
        return { error: null };
      } else {
        return { error: 'Not authorized to delete this date idea' };
      }
    }
    
    return { error: 'Date idea not found' };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Add bucket list item
export const addBucketListItem = async (
  userId: string,
  userName: string,
  title: string
) => {
  try {
    const bucketItem: Omit<BucketListItem, 'id'> = {
      userId,
      userName,
      title,
      completed: false,
      createdAt: Date.now()
    };
    
    const docRef = await addDoc(collection(db, 'bucketList'), bucketItem);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

// Get shared bucket list items
export const getSharedBucketList = async (userId: string, partnerId: string) => {
  try {
    const bucketRef = collection(db, 'bucketList');
    const q = query(
      bucketRef,
      where('userId', 'in', [userId, partnerId]),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const items: BucketListItem[] = [];
    
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as BucketListItem);
    });
    
    return { items, error: null };
  } catch (error: any) {
    return { items: [], error: error.message };
  }
};

// Update bucket list item
export const updateBucketListItem = async (
  itemId: string,
  userId: string,
  updates: Partial<Pick<BucketListItem, 'title' | 'completed'>>
) => {
  try {
    const itemRef = doc(db, 'bucketList', itemId);
    
    // Check if user owns this item
    const itemDoc = await getDoc(itemRef);
    if (itemDoc.exists()) {
      const item = itemDoc.data() as BucketListItem;
      if (item.userId === userId) {
        const updateData: any = { ...updates };
        if (updates.completed && !item.completed) {
          updateData.completedAt = Date.now();
        }
        
        await updateDoc(itemRef, updateData);
        return { error: null };
      } else {
        return { error: 'Not authorized to edit this item' };
      }
    }
    
    return { error: 'Item not found' };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Delete bucket list item
export const deleteBucketListItem = async (itemId: string, userId: string) => {
  try {
    const itemRef = doc(db, 'bucketList', itemId);
    
    // Check if user owns this item
    const itemDoc = await getDoc(itemRef);
    if (itemDoc.exists()) {
      const item = itemDoc.data() as BucketListItem;
      if (item.userId === userId) {
        await deleteDoc(itemRef);
        return { error: null };
      } else {
        return { error: 'Not authorized to delete this item' };
      }
    }
    
    return { error: 'Item not found' };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Real-time subscription for shared bucket list
export const subscribeToSharedBucketList = (
  userId: string,
  partnerId: string,
  callback: (items: BucketListItem[]) => void
) => {
  const bucketRef = collection(db, 'bucketList');
  const q = query(
    bucketRef,
    where('userId', 'in', [userId, partnerId]),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const items: BucketListItem[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as BucketListItem);
    });
    callback(items);
  });
};
