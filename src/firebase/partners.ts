import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './config';
import { generatePartnerCode } from './auth';

export interface PartnerConnection {
  id: string;
  partner1Id: string;
  partner2Id?: string;
  partnerCode: string;
  createdAt: number;
  status: 'pending' | 'connected';
}

// Create partner connection with code
export const createPartnerConnection = async (userId: string, partnerCode: string) => {
  try {
    const connectionId = `${userId}_${Date.now()}`;
    const connection: PartnerConnection = {
      id: connectionId,
      partner1Id: userId,
      partnerCode,
      createdAt: Date.now(),
      status: 'pending'
    };
    
    await setDoc(doc(db, 'partnerConnections', connectionId), connection);
    return { connection, error: null };
  } catch (error: any) {
    return { connection: null, error: error.message };
  }
};

// Join partner connection with code
export const joinPartnerConnection = async (userId: string, partnerCode: string) => {
  try {
    // Find connection by partner code
    const connectionsRef = collection(db, 'partnerConnections');
    const q = query(connectionsRef, where('partnerCode', '==', partnerCode), where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, error: 'Invalid partner code' };
    }
    
    const connectionDoc = querySnapshot.docs[0];
    const connection = connectionDoc.data() as PartnerConnection;
    
    // Update connection
    await updateDoc(doc(db, 'partnerConnections', connectionDoc.id), {
      partner2Id: userId,
      status: 'connected'
    });
    
    // Update both users' profiles
    await updateDoc(doc(db, 'users', connection.partner1Id), {
      partnerId: userId
    });
    await updateDoc(doc(db, 'users', userId), {
      partnerId: connection.partner1Id
    });
    
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Get partner connection
export const getPartnerConnection = async (userId: string) => {
  try {
    const connectionsRef = collection(db, 'partnerConnections');
    const q = query(connectionsRef, where('partner1Id', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as PartnerConnection;
    }
    
    // Check if user is partner2
    const q2 = query(connectionsRef, where('partner2Id', '==', userId));
    const querySnapshot2 = await getDocs(q2);
    
    if (!querySnapshot2.empty) {
      return querySnapshot2.docs[0].data() as PartnerConnection;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting partner connection:', error);
    return null;
  }
};
