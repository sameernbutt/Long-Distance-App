import { db } from './config';
import { collection, doc, setDoc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';

export interface DailyAnswer {
  userId: string;
  question: string;
  answer: string;
  date: string; // ISO date string
}

export interface DailyQuestionDoc {
  question: string;
  date: string;
  questionIndex: number;
}

let questions: string[] = [
  // fallback list in case CSV fetch fails
  "Questions weren't able to be loaded today, sorry! Regardless, how is your day?",
];

// Try to load questions from public/dailyQuestions.csv (served by Vite)
const loadQuestionsFromCSV = async () => {
  try {
    const res = await fetch('/resources/dailyQuestions.csv');
    if (!res.ok) throw new Error('Failed to fetch CSV');
    const text = await res.text();
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) questions = lines;
  } catch (e) {
    console.warn('Could not load dailyQuestions.csv, falling back to built-in list', e);
  }
};

// warm-load CSV at module initialization (best-effort)
loadQuestionsFromCSV();

// Get today's global daily question (same for all users)
export const getTodaysDailyQuestion = async (): Promise<string> => {
  const today = new Date().toDateString();
  const questionDocRef = doc(db, 'globalDailyQuestions', today);
  
  try {
    const questionDoc = await getDoc(questionDocRef);
    
    if (questionDoc.exists()) {
      return questionDoc.data().question;
    } else {
      // Generate new question for today
      const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
      const questionIndex = daysSinceEpoch % questions.length;
      const todaysQuestion = questions[questionIndex];
      
      // Save to Firestore
      await setDoc(questionDocRef, {
        question: todaysQuestion,
        date: today,
        questionIndex: questionIndex
      });
      
      return todaysQuestion;
    }
  } catch (error) {
    console.error('Error getting daily question:', error);
    // Fallback to deterministic question
    const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return questions[daysSinceEpoch % questions.length];
  }
};

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

/*
Note on CSV archive behavior:
- The app now loads questions from `public/dailyQuestions.csv` at runtime (served by Vite/static host).
- Moving a used question from that CSV into an archive CSV cannot be done reliably from client-side code because the browser cannot modify files on the server/public folder.
- If you want used questions to be removed and archived, implement a small server-side script or Cloud Function that:
  1) Reads the CSV, removes the used line, appends it to dailyQuestionsArchive.csv (or stores it in Firestore), and
  2) Exposes an authenticated endpoint the app calls to request a new question.
- I left a built-in fallback list so the app continues working without any backend change.
*/
