import { useState, useEffect } from 'react';
import { Heart, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { shareMood, getPartnerMoods, subscribeToPartnerMoods, getPartnerId } from '../firebase/moods';
import { getUserProfile } from '../firebase/profile';

interface MoodSharingProps {
  isDarkMode?: boolean;
}

interface Mood {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
}

const moods: Mood[] = [
  {
    id: 'happy',
    name: 'Happy',
    emoji: '😊',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  {
    id: 'sad',
    name: 'Sad',
    emoji: '😢',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    id: 'excited',
    name: 'Excited',
    emoji: '🤩',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100'
  },
  {
    id: 'hungry',
    name: 'Hungry',
    emoji: '😋',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  {
    id: 'tired',
    name: 'Tired',
    emoji: '🥱',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    id: 'nervous',
    name: 'Nervous',
    emoji: '😰',
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  {
    id: 'anxious',
    name: 'Anxious',
    emoji: '😟',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100'
  },
  {
    id: 'sensitive',
    name: 'Sensitive',
    emoji: '🥺',
    color: 'text-rose-600',
    bgColor: 'bg-rose-100'
  },
  {
    id: 'stressed',
    name: 'Stressed',
    emoji: '😫',
    color: 'text-red-700',
    bgColor: 'bg-red-200'
  },
  {
    id: 'content',
    name: 'Content',
    emoji: '🙂',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    id: 'chill',
    name: 'Chill',
    emoji: '😎',
    color: 'text-teal-600',
    bgColor: 'bg-teal-100'
  },
  {
    id: 'motivated',
    name: 'Motivated',
    emoji: '😄',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100'
  },
  {
    id: 'frustrated',
    name: 'Frustrated',
    emoji: '😤',
    color: 'text-orange-700',
    bgColor: 'bg-orange-200'
  },
  {
    id: 'calm',
    name: 'Calm',
    emoji: '😌',
    color: 'text-blue-500',
    bgColor: 'bg-blue-100'
  },
  {
    id: 'bored',
    name: 'Bored',
    emoji: '😐',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100'
  },
  {
    id: 'horny',
    name: 'Horny',
    emoji: '😏',
    color: 'text-pink-700',
    bgColor: 'bg-pink-200'
  },  
  {
    id: 'energized',
    name: 'Energized',
    emoji: '🤩',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-200'
  }  
];


export default function MoodSharing({ isDarkMode = false }: MoodSharingProps = {}) {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  // message feature removed — keep history only
  const [moodHistory, setMoodHistory] = useState<Array<{
    id: string;
    mood: string;
    message: string;
    timestamp: number;
  }>>([]);
  const [partnerMoods, setPartnerMoods] = useState<Array<{
    id: string;
    mood: string;
    emoji: string;
    message: string;
    timestamp: any;
  }>>([]);
  const [isShared, setIsShared] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<any | null>(null);

  useEffect(() => {
    // Load mood history from localStorage
    const saved = localStorage.getItem('moodHistory');
    if (saved) {
      setMoodHistory(JSON.parse(saved));
    }
  }, []);

  // Get partner ID and load partner moods
  useEffect(() => {
    const loadPartnerData = async () => {
      if (user?.uid) {
        const partner = await getPartnerId(user.uid);
        setPartnerId(partner);
        
        if (partner) {
          // Load partner profile (for display name)
          try {
            const pProfile = await getUserProfile(partner);
            setPartnerProfile(pProfile);
          } catch (err) {
            console.error('Failed to load partner profile', err);
          }

          // Load partner moods
          const { moods, error } = await getPartnerMoods(user.uid);
          if (error) {
            console.error('Error loading partner moods:', error);
          }
          setPartnerMoods(moods);

          // Subscribe to real-time partner mood updates
          const unsubscribe = subscribeToPartnerMoods(user.uid, (moods) => {
            setPartnerMoods(moods);
          });

          return unsubscribe;
        }
      }
    };

    loadPartnerData();
  }, [user?.uid]);

  const handleMoodSelect = async (moodId: string) => {
    setSelectedMood(moodId);
    setIsShared(false);
    // Auto-share immediately when selecting a mood
    const mood = moods.find(m => m.id === moodId);
    if (!mood || !user?.uid) return;
    try {
      if (partnerId) {
        await shareMood(user.uid, partnerId, mood.name, mood.emoji, '');
      }

      const newMoodEntry = {
        id: Date.now().toString(),
        mood: mood.name,
        message: '',
        timestamp: Date.now()
      };
      const updatedHistory = [newMoodEntry, ...moodHistory.slice(0, 4)];
      setMoodHistory(updatedHistory);
      localStorage.setItem('moodHistory', JSON.stringify(updatedHistory));
      setIsShared(true);
      setTimeout(() => {
        setSelectedMood(null);
        setIsShared(false);
      }, 1500);
    } catch (err) {
      console.error('Error auto-sharing mood', err);
    }
  };

  // handleShareMood removed — moods are shared immediately on selection

  const formatTime = (timestamp: number | any) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`rounded-xl p-4 md:p-6 shadow-lg border transition-colors ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="text-center mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-fit mx-auto mb-3">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <h3 className={`text-lg font-bold mb-2 transition-colors ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>Share Your Mood</h3>
        <p className={`text-sm transition-colors ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>Let your partner know how you're feeling today!</p>
      </div>

      {/* Mood Selection */}
      <div className="mb-6">
        {/* <h4 className="text-sm font-medium text-gray-700 mb-3">How are you feeling?</h4> */}
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood.id)}
              className={`flex-shrink-0 w-24 p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedMood === mood.id
                  ? `border-${mood.color.split('-')[1]}-300 ${mood.bgColor}`
                  : isDarkMode 
                    ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-3xl mb-2">{mood.emoji}</div>
              <div className={`text-sm font-medium ${mood.color}`}>{mood.name}</div>
            </button>
          ))}
        </div>
      </div>


      {/* Message feature removed — moods are sent immediately on selection */}

      {/* Success Message */}
      {isShared && (
        <div className={`mb-6 p-4 border rounded-lg transition-colors ${
          isDarkMode 
            ? 'bg-green-900/20 border-green-800 text-green-400' 
            : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5" />
            <span className="font-medium">Mood shared successfully!</span>
          </div>
        </div>
      )}

      {/* Current Moods Display */}
      <div className="mb-6">
        {/* <h4 className="text-sm font-medium text-gray-700 mb-3">Current Moods</h4> */}
        <div className="flex gap-3">
          {/* Your Current Mood - header + stacked emoji + label/time */}
          <div className="flex-1">
            <h5 className="text-xs font-medium text-blue-700 mb-2">Your Mood</h5>
            <div className={`flex items-center justify-center p-3 rounded-lg border transition-colors ${
              isDarkMode 
                ? 'bg-blue-900/20 border-blue-800' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              {moodHistory.length > 0 ? (
                <div className="flex flex-col items-center">
                  <div className="text-2xl">{moods.find(m => m.name === moodHistory[0].mood)?.emoji || '😊'}</div>
                  <div className={`text-sm font-medium mt-1 transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>{moodHistory[0].mood}</div>
                  <div className={`text-xs transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>{formatTime(moodHistory[0].timestamp)}</div>
                </div>
              ) : (
                <div className={`text-sm transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>Share your mood to get started!</div>
              )}
            </div>
          </div>

          {/* Partner's Current Mood - header uses partner's name, stacked emoji + label/time */}
          <div className="flex-1">
            <h5 className={`text-xs font-medium mb-2 transition-colors ${
              isDarkMode ? 'text-pink-300' : 'text-pink-700'
            }`}>{partnerProfile?.displayName || 'Partner'}'s Mood</h5>
            <div className={`flex items-center justify-center p-3 rounded-lg border transition-colors ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600' 
                : 'bg-pink-50 border-pink-200'
            }`}>
              {partnerId ? (
                partnerMoods.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="text-2xl">{partnerMoods[0].emoji}</div>
                    <div className={`text-sm font-medium mt-1 transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>{partnerMoods[0].mood}</div>
                    <div className={`text-xs transition-colors ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>{formatTime(partnerMoods[0].timestamp)}</div>
                  </div>
                ) : (
                  <div className={`text-sm transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>No mood shared yet</div>
                )
              ) : (
                <div className={`text-sm transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>Not paired with partner</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
