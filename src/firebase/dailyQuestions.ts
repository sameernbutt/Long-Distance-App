import { db } from './config';
import { collection, doc, setDoc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';

export interface DailyAnswer {
  userId: string;
  question: string;
  answer: string;
  date: string; // ISO date string
}

// Save or update a user's answer for a given date
export const saveDailyAnswer = async (userId: string, question: string, answer: string, date: string) => {
  const ref = doc(db, 'dailyAnswers', `${userId}_${date}`);
  await setDoc(ref, { userId, question, answer, date }, { merge: true });
};

// Get a user's answer for a given date
export const getDailyAnswer = async (userId: string, date: string) => {
  const ref = doc(db, 'dailyAnswers', `${userId}_${date}`);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() as DailyAnswer : null;
};

// Get both users' answers for a given date
export const getCoupleAnswers = async (userId: string, partnerId: string, date: string) => {
  const q = query(
    collection(db, 'dailyAnswers'),
    where('userId', 'in', [userId, partnerId]),
    where('date', '==', date)
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as DailyAnswer);
};
