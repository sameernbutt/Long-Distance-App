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

const questions = [
  "What's one thing that made you smile today?",
  "If you could have dinner with anyone in the world, who would it be and why?",
  "What's your favorite memory of us together?",
  "What are you most looking forward to in our future?",
  "What's something new you'd like to try together?",
  "What song reminds you of me?",
  "What's the best advice you've ever received?",
  "If we could go anywhere in the world right now, where would you want to go?",
  "What's something you've always wanted to learn?",
  "What made you fall in love with me?",
  "What's your biggest dream?",
  "What's something you're grateful for today?",
  "If you could relive any day with me, which would it be?",
  "What's your favorite thing about our relationship?",
  "What's something that always makes you laugh?",
  "What's your love language and how do you like to receive love?",
  "What's a goal you want to achieve this year?",
  "What's your favorite way to spend a lazy day?",
  "What's something you admire about me?",
  "What's your favorite season and why?",
];

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
