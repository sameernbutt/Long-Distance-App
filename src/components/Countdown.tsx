import { useState, useEffect } from 'react';
import { Calendar, Clock, Heart, MapPin, Edit } from 'lucide-react';

interface CountdownData {
  date: string;
  title: string;
  location: string;
}

export default function Countdown() {
  const [countdownData, setCountdownData] = useState<CountdownData>(() => {
    const saved = localStorage.getItem('countdownData');
    return saved ? JSON.parse(saved) : {
      date: '',
      title: 'Next Meeting',
      location: ''
    };
  });
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const [isEditing, setIsEditing] = useState(!countdownData.date);
  const [editData, setEditData] = useState(countdownData);

  useEffect(() => {
    if (!countdownData.date) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const targetDate = new Date(countdownData.date).getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownData.date]);

  const saveCountdown = () => {
    if (!editData.date) return;
    
    setCountdownData(editData);
    localStorage.setItem('countdownData', JSON.stringify(editData));
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="p-4 md:p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Countdown to Reunion</h2>
        <p className="text-gray-600 text-sm md:text-base">Count down the days until you're together again</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Edit Form */}
        {isEditing ? (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Set Your Reunion</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Next Meeting, Vacation Together, etc."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={editData.date}
                  onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (optional)
                </label>
                <input
                  type="text"
                  value={editData.location}
                  onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Paris, My hometown, etc."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={saveCountdown}
                disabled={!editData.date}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                Save Countdown
              </button>
              {countdownData.date && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Countdown Display */
          <div className="space-y-6">
            {/* Event Info */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
              <div className="text-center">
                <div className="flex items-center justify-between mb-4">
                  <div></div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-100 rounded-full transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
                
                <Heart className="w-12 h-12 text-pink-500 fill-current mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{countdownData.title}</h3>
                
                <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(countdownData.date)}</span>
                </div>
                
                {countdownData.location && (
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{countdownData.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="grid grid-cols-4 gap-4 text-center">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Minutes', value: timeLeft.minutes },
                  { label: 'Seconds', value: timeLeft.seconds }
                ].map((item, index) => (
                  <div key={item.label} className="space-y-2">
                    <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent ${
                      index === 3 ? 'animate-pulse' : ''
                    }`}>
                      {item.value.toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-gray-600 uppercase tracking-wide font-medium">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              {timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 && countdownData.date && (
                <div className="mt-6 text-center">
                  <div className="text-2xl font-bold text-pink-600 mb-2">🎉 Today's the day! 🎉</div>
                  <p className="text-gray-600">Hope you have an amazing time together!</p>
                </div>
              )}
            </div>

            {/* Motivational Messages */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="text-center">
                  <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-blue-800 font-medium">Every moment apart brings you closer to being together</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-200">
                <div className="text-center">
                  <Heart className="w-8 h-8 text-rose-500 fill-current mx-auto mb-2" />
                  <p className="text-sm text-rose-800 font-medium">Distance means nothing when someone means everything</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}