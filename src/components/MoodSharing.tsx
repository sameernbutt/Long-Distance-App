import { useState, useEffect } from 'react';
import { Heart, Smile, Frown, Meh, Send, Check } from 'lucide-react';

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


export default function MoodSharing() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodMessage, setMoodMessage] = useState('');
  const [moodHistory, setMoodHistory] = useState<Array<{
    id: string;
    mood: string;
    message: string;
    timestamp: number;
  }>>([]);
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    // Load mood history from localStorage
    const saved = localStorage.getItem('moodHistory');
    if (saved) {
      setMoodHistory(JSON.parse(saved));
    }
  }, []);

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    setIsShared(false);
  };

  const handleShareMood = () => {
    if (!selectedMood) return;

    const mood = moods.find(m => m.id === selectedMood);
    if (!mood) return;

    const newMoodEntry = {
      id: Date.now().toString(),
      mood: mood.name,
      message: moodMessage.trim() || `${mood.emoji} Feeling ${mood.name.toLowerCase()} today!`,
      timestamp: Date.now()
    };

    const updatedHistory = [newMoodEntry, ...moodHistory.slice(0, 4)]; // Keep last 5 entries
    setMoodHistory(updatedHistory);
    localStorage.setItem('moodHistory', JSON.stringify(updatedHistory));

    setIsShared(true);
    setMoodMessage('');
    
    // Reset selection after 2 seconds
    setTimeout(() => {
      setSelectedMood(null);
      setIsShared(false);
    }, 2000);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-100">
      <div className="text-center mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-fit mx-auto mb-3">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Share Your Mood</h3>
        <p className="text-sm text-gray-600">Let your partner know how you're feeling today</p>
      </div>

      {/* Mood Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">How are you feeling?</h4>
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood.id)}
              className={`flex-shrink-0 w-24 p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedMood === mood.id
                  ? `border-${mood.color.split('-')[1]}-300 ${mood.bgColor}`
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-3xl mb-2">{mood.emoji}</div>
              <div className={`text-sm font-medium ${mood.color}`}>{mood.name}</div>
            </button>
          ))}
        </div>
      </div>


      {/* Message Input */}
      {selectedMood && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add a message (optional)
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={moodMessage}
              onChange={(e) => setMoodMessage(e.target.value)}
              placeholder="Share what's on your mind..."
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
            <button
              onClick={handleShareMood}
              disabled={isShared}
              className={`px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                isShared
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
              }`}
            >
              {isShared ? (
                <Check className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {isShared && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-700">
            <Check className="w-5 h-5" />
            <span className="font-medium">Mood shared successfully!</span>
          </div>
        </div>
      )}

      {/* Mood History */}
      {moodHistory.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Moods</h4>
          <div className="space-y-2">
            {moodHistory.slice(0, 3).map((entry) => {
              const mood = moods.find(m => m.name === entry.mood);
              return (
                <div
                  key={entry.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="text-2xl">{mood?.emoji || '😊'}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{entry.message}</div>
                    <div className="text-xs text-gray-500">{formatTime(entry.timestamp)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Partner Status */}
      <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Partner Status</div>
          <div className="text-lg font-semibold text-gray-800">
            {moodHistory.length > 0 ? 'Connected' : 'Waiting for mood share'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {moodHistory.length > 0 
              ? 'Your partner can see your mood updates'
              : 'Share your first mood to connect with your partner'
            }
          </div>
        </div>
      </div>
    </div>
  );
}
