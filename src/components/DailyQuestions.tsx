import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPartnerId } from '../firebase/moods';
import { saveDailyAnswer, getCoupleAnswers, getTodaysDailyQuestion } from '../firebase/dailyQuestions';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface DailyQuestionsProps {
  isDarkMode?: boolean;
}

export default function DailyQuestions({ isDarkMode = false }: DailyQuestionsProps) {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [coupleAnswers, setCoupleAnswers] = useState<{ [uid: string]: { answer: string, name: string } }>({});
  const [loading, setLoading] = useState(true);
  const { user, userProfile } = useAuth();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);

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
    
    const loadAnswers = async () => {
      try {
        setLoading(true);
        const today = new Date().toDateString();
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
        setAnswer(ansObj[user.uid]?.answer || '');
      } catch (error) {
        console.error('Error loading answers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnswers();
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
        <h2 className={`text-2xl md:text-3xl font-bold mb-2 transition-colors ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>Daily Question</h2>
        <p className={`text-sm md:text-base transition-colors ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>Connect deeper with thoughtful questions</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className={`rounded-xl p-4 md:p-6 mb-6 border transition-colors ${
          isDarkMode 
            ? 'bg-gray-900' 
            : 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200'
        }`}>
          <div className="flex items-start space-x-3 mb-4">
            <div className="p-2 bg-pink-500 rounded-full">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold mb-2 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Today's Question</h3>
              <p className={`text-base md:text-lg leading-relaxed transition-colors ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {loading ? 'Loading today\'s question...' : currentQuestion}
              </p>
            </div>
          </div>
          {!editing ? (
            <div className="flex justify-center">
              {!coupleAnswers[user?.uid]?.answer && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-medium"
                >
                  {Object.keys(coupleAnswers).length === 0 ? 'Be the first to answer!' : 'Answer'}
                </button>
              )}
            </div>
          ) : (
            <>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Share your thoughts..."
                className={`w-full p-3 md:p-4 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-sm md:text-base transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
                rows={4}
              />
              <div className="flex justify-between items-center mt-4">
                <span className={`text-sm transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>{answer.length}/500 characters</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => { setEditing(false); setAnswer(coupleAnswers[user?.uid]?.answer || ''); }}
                    className={`px-4 py-2 rounded-xl transition-all duration-200 text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => { await saveAnswer(); setEditing(false); }}
                    disabled={!answer.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Answers Display */}
        {Object.keys(coupleAnswers).length > 0 && (
          <div className={`rounded-xl p-4 md:p-6 shadow-lg border transition-colors ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-600' 
              : 'bg-white border-gray-100'
          }`}>
            <h4 className={`font-semibold mb-4 transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>Today's Answers</h4>
            <div className="space-y-4">
              {Object.entries(coupleAnswers).map(([uid, val]) => (
                <div key={uid} className={`rounded-xl p-4 border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`font-medium mb-2 text-sm transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>{val.name}</p>
                  <p className={`text-sm transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{val.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}