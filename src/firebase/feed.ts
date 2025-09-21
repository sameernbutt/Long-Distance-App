// Add a comment to a feed item
export const addComment = async (
  itemId: string,
  userId: string,
  userName: string,
  content: string
) => {
  try {
    const comment = {
      id: `${userId}_${Date.now()}`,
      userId,
      userName,
      content,
      timestamp: Date.now(),
    };
    const itemRef = doc(db, 'feed', itemId);
    await updateDoc(itemRef, {
      comments: arrayUnion(comment),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Add or remove an emoji reaction to a feed item
export const toggleReaction = async (
  itemId: string,
  userId: string,
  emoji: string
) => {
  try {
    const itemRef = doc(db, 'feed', itemId);
    const itemSnap = await getDoc(itemRef);
    if (!itemSnap.exists()) return { error: 'Item not found' };
    const item = itemSnap.data();
    let reactions = item.reactions || {};
    if (!reactions[emoji]) reactions[emoji] = [];
    if (reactions[emoji].includes(userId)) {
      reactions[emoji] = reactions[emoji].filter((id: string) => id !== userId);
      if (reactions[emoji].length === 0) delete reactions[emoji];
    } else {
      reactions[emoji].push(userId);
    }
    await updateDoc(itemRef, { reactions });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};
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
import { getDoc } from 'firebase/firestore';
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
  reactions?: { [emoji: string]: string[] };
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
  const path = `feed/${userId}/${Date.now()}_${file.name}`;
  const fileRef = ref(storage, path);
  console.log('[uploadFile] uploading to storage path:', path);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  console.log('[uploadFile] got download URL:', url);
  return url;
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
