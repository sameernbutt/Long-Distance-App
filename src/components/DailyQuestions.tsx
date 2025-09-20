import { useState, useEffect } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPartnerId } from '../firebase/moods';
import { saveDailyAnswer, getCoupleAnswers, getTodaysDailyQuestion } from '../firebase/dailyQuestions';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function DailyQuestions() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [coupleAnswers, setCoupleAnswers] = useState<{ [uid: string]: { answer: string, name: string } }>({});
  const [loading, setLoading] = useState(true);
  const { user, userProfile } = useAuth();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      const pid = await getPartnerId(user.uid);
      setPartnerId(pid);
      
      if (pid) {
        // Load partner profile
        const partnerDoc = await getDoc(doc(db, 'users', pid));
        if (partnerDoc.exists()) {
          setPartnerProfile(partnerDoc.data());
        }
      }
    };
    
    loadData();
    
    // Load today's global question
    const loadTodaysQuestion = async () => {
      setLoading(true);
      try {
        const todaysQuestion = await getTodaysDailyQuestion();
        setCurrentQuestion(todaysQuestion);
      } catch (error) {
        console.error('Error loading daily question:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTodaysQuestion();
  }, [user]);

  useEffect(() => {
    if (!user || !partnerId || !currentQuestion) return;
    setLoading(true);
    const today = new Date().toDateString();
    getCoupleAnswers(user.uid, partnerId, today).then((answers) => {
      const ansObj: { [uid: string]: { answer: string, name: string } } = {};
      answers.forEach(a => {
        if (a.userId === user.uid) {
          ansObj[a.userId] = { answer: a.answer, name: userProfile?.displayName || 'You' };
        } else {
          ansObj[a.userId] = { answer: a.answer, name: partnerProfile?.displayName || 'Partner' };
        }
      });
      setCoupleAnswers(ansObj);
      setAnswer(ansObj[user.uid]?.answer || '');
      setLoading(false);
    });
  }, [user, partnerId, currentQuestion, userProfile, partnerProfile]);

  const saveAnswer = async () => {
    if (!user) return;
    const today = new Date().toDateString();
    await saveDailyAnswer(user.uid, currentQuestion, answer, today);
    // Refresh couple answers
    if (partnerId) {
      const answers = await getCoupleAnswers(user.uid, partnerId, today);
      const ansObj: { [uid: string]: { answer: string, name: string } } = {};
      answers.forEach(a => {
        if (a.userId === user.uid) {
          ansObj[a.userId] = { answer: a.answer, name: userProfile?.displayName || 'You' };
        } else {
          ansObj[a.userId] = { answer: a.answer, name: partnerProfile?.displayName || 'Partner' };
        }
      });
      setCoupleAnswers(ansObj);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Daily Question</h2>
        <p className="text-gray-600 text-sm md:text-base">Connect deeper with thoughtful questions</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 md:p-6 mb-6 border border-pink-200">
          <div className="flex items-start space-x-3 mb-4">
            <div className="p-2 bg-pink-500 rounded-full">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-2">Today's Question</h3>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                {loading ? 'Loading today\'s question...' : currentQuestion}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-100">
          <h4 className="font-semibold text-gray-800 mb-3">Your Answer</h4>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-3 md:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-sm md:text-base"
            rows={4}
            disabled={!!coupleAnswers[user?.uid]?.answer}
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500">
              {answer.length}/500 characters
            </span>
            <button
              onClick={saveAnswer}
              disabled={!answer.trim() || !!coupleAnswers[user?.uid]?.answer}
              className="flex items-center space-x-2 px-4 md:px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm md:text-base"
            >
              <Heart className="w-4 h-4" />
              <span>Save Answer</span>
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h4 className="font-semibold text-gray-800 mb-4">Today's Answers</h4>
          <div className="space-y-4">
            {Object.entries(coupleAnswers).map(([uid, val]) => (
              <div key={uid} className="bg-gray-50 rounded-xl p-4 border">
                <p className="font-medium text-gray-700 mb-2 text-sm">{val.name}</p>
                <p className="text-gray-600 text-sm">{val.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}