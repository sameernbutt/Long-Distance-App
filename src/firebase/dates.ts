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
  getDoc,
  setDoc
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

export interface DateNight {
  id: string;
  coupleId: string;
  activity: string;
  datetime: string; // ISO string for date and time
  setBy: string;
  setByName: string;
  createdAt: number;
  updatedAt: number;
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
    console.log('Adding bucket list item:', { userId, userName, title });
    const bucketItem: Omit<BucketListItem, 'id'> = {
      userId,
      userName,
      title,
      completed: false,
      createdAt: Date.now()
    };
    
    console.log('Bucket item to add:', bucketItem);
    const docRef = await addDoc(collection(db, 'bucketList'), bucketItem);
    console.log('Bucket item added with ID:', docRef.id);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    console.error('Error adding bucket list item:', error);
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
    console.log('Deleting bucket list item:', { itemId, userId });
    const itemRef = doc(db, 'bucketList', itemId);
    
    // Check if user owns this item
    const itemDoc = await getDoc(itemRef);
    if (itemDoc.exists()) {
      const item = itemDoc.data() as BucketListItem;
      console.log('Found item to delete:', item);
      if (item.userId === userId) {
        await deleteDoc(itemRef);
        console.log('Successfully deleted item:', itemId);
        return { error: null };
      } else {
        console.log('User not authorized to delete item:', { itemUserId: item.userId, requestUserId: userId });
        return { error: 'Not authorized to delete this item' };
      }
    }
    
    console.log('Item not found:', itemId);
    return { error: 'Item not found' };
  } catch (error: any) {
    console.error('Error in deleteBucketListItem:', error);
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
    console.log('Bucket list query snapshot received, size:', querySnapshot.size);
    const items: BucketListItem[] = [];
    querySnapshot.forEach((doc) => {
      const item = { id: doc.id, ...doc.data() } as BucketListItem;
      console.log('Bucket list item:', item);
      items.push(item);
    });
    console.log('Final bucket list items:', items);
    callback(items);
  }, (error) => {
    console.error('Error in bucket list subscription:', error);
  });
};

// Date Night Functions

// Get couple date night
export const getCoupleDateNight = async (userId: string, partnerId: string): Promise<DateNight | null> => {
  try {
    const coupleId = [userId, partnerId].sort().join('_');
    const dateNightDoc = await getDoc(doc(db, 'coupleDateNights', coupleId));
    return dateNightDoc.exists() ? { id: dateNightDoc.id, ...dateNightDoc.data() } as DateNight : null;
  } catch (error) {
    console.error('Error getting couple date night:', error);
    return null;
  }
};

// Set couple date night
export const setCoupleDateNight = async (
  userId: string,
  partnerId: string,
  userName: string,
  dateNightData: { activity: string; datetime: string }
) => {
  try {
    const coupleId = [userId, partnerId].sort().join('_');
    const data: Omit<DateNight, 'id'> = {
      coupleId,
      ...dateNightData,
      setBy: userId,
      setByName: userName,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await setDoc(doc(db, 'coupleDateNights', coupleId), data);
    return { success: true };
  } catch (error) {
    console.error('Error setting couple date night:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Listen to couple date night changes (real-time sync)
export const subscribeToDateNightChanges = (
  userId: string,
  partnerId: string,
  callback: (dateNight: DateNight | null) => void
) => {
  const coupleId = [userId, partnerId].sort().join('_');
  const dateNightRef = doc(db, 'coupleDateNights', coupleId);
  
  return onSnapshot(dateNightRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as DateNight);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error listening to date night changes:', error);
    callback(null);
  });
};

// Delete couple date night
export const deleteCoupleDateNight = async (userId: string, partnerId: string) => {
  try {
    const coupleId = [userId, partnerId].sort().join('_');
    await deleteDoc(doc(db, 'coupleDateNights', coupleId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting couple date night:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
