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
  arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './config';

export interface FeedItem {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  type: 'photo' | 'video' | 'music';
  content: string; // URL for photos/videos, link for music
  caption: string;
  timestamp: number;
  likes: string[]; // Array of user IDs who liked
  comments: FeedComment[];
}

export interface FeedComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
}

// Upload file to storage
export const uploadFile = async (file: File, userId: string): Promise<string> => {
  const fileRef = ref(storage, `feed/${userId}/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};

// Add item to feed
export const addFeedItem = async (
  userId: string,
  userName: string,
  userPhotoURL: string | undefined,
  type: 'photo' | 'video' | 'music',
  content: string,
  caption: string
) => {
  try {
    const feedItem: Omit<FeedItem, 'id'> = {
      userId,
      userName,
      userPhotoURL,
      type,
      content,
      caption,
      timestamp: Date.now(),
      likes: [],
      comments: []
    };
    
    const docRef = await addDoc(collection(db, 'feed'), feedItem);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

// Get feed items for partners
export const getFeedItems = async (userId: string, partnerId: string) => {
  try {
    const feedRef = collection(db, 'feed');
    const q = query(
      feedRef,
      where('userId', 'in', [userId, partnerId]),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const items: FeedItem[] = [];
    
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as FeedItem);
    });
    
    return { items, error: null };
  } catch (error: any) {
    return { items: [], error: error.message };
  }
};

// Like/unlike feed item
export const toggleLike = async (itemId: string, userId: string, isLiked: boolean) => {
  try {
    const itemRef = doc(db, 'feed', itemId);
    
    if (isLiked) {
      await updateDoc(itemRef, {
        likes: arrayRemove(userId)
      });
    } else {
      await updateDoc(itemRef, {
        likes: arrayUnion(userId)
      });
    }
    
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Delete feed item
export const deleteFeedItem = async (itemId: string, userId: string) => {
  try {
    // Get the item to check ownership and delete file if needed
    const itemDoc = await getDoc(doc(db, 'feed', itemId));
    if (itemDoc.exists()) {
      const item = itemDoc.data() as FeedItem;
      
      // Only allow deletion by the user who posted it
      if (item.userId === userId) {
        // Delete file from storage if it's a photo or video
        if (item.type === 'photo' || item.type === 'video') {
          try {
            const fileRef = ref(storage, item.content);
            await deleteObject(fileRef);
          } catch (error) {
            console.log('File not found in storage, continuing with deletion');
          }
        }
        
        // Delete the document
        await deleteDoc(doc(db, 'feed', itemId));
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
