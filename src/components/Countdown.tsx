import { useState, useEffect } from 'react';
import { Calendar, Clock, Heart, MapPin, Edit, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPartnerId } from '../firebase/moods';
import { getCoupleReunion, setCoupleReunion, subscribeToReunionChanges, ReunionData } from '../firebase/reunion';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface CountdownData {
  date: string;
  title: string;
  location: string;
}

export default function Countdown() {
  const { user, isGuest } = useAuth();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [countdownData, setCountdownData] = useState<CountdownData>({
    date: '',
    title: 'Next Meeting',
    location: ''
  });
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [showSetReunion, setShowSetReunion] = useState(false);
  const [editData, setEditData] = useState(countdownData);
  const [loading, setLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Load partner ID
  useEffect(() => {
    const loadPartner = async () => {
      if (user?.uid && !isGuest) {
        try {
          const pId = await getPartnerId(user.uid);
          setPartnerId(pId);
        } catch (error) {
          console.error('Error loading partner:', error);
        }
      }
      setLoading(false);
    };

    loadPartner();
  }, [user?.uid, isGuest]);

  // Load and subscribe to reunion data
  useEffect(() => {
    if (!user?.uid || !partnerId || isGuest) {
      setLoading(false);
      return;
    }

    // Subscribe to real-time updates
    const unsubscribe = subscribeToReunionChanges(user.uid, partnerId, (reunion: ReunionData | null) => {
      if (reunion) {
        setCountdownData({
          date: reunion.date,
          title: reunion.title,
          location: reunion.location
        });
        setEditData({
          date: reunion.date,
          title: reunion.title,
          location: reunion.location
        });
      } else {
        setCountdownData({
          date: '',
          title: 'Next Meeting',
          location: ''
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, partnerId, isGuest]);

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

  const saveCountdown = async () => {
    if (!editData.date || !user?.uid || !partnerId) return;
    
    try {
      const result = await setCoupleReunion(user.uid, partnerId, {
        date: editData.date,
        title: editData.title || 'Next Meeting',
        location: editData.location
      });
      
      if (result.success) {
        setIsEditing(false);
        setShowSetReunion(false);
      } else {
        alert('Failed to save reunion. Please try again.');
      }
    } catch (error) {
      console.error('Error saving reunion:', error);
      alert('Failed to save reunion. Please try again.');
    }
  };

  const handleSetReunion = () => {
    setEditData({
      date: '',
      title: 'Next Meeting',
      location: ''
    });
    setShowSetReunion(true);
    setIsEditing(true);
  };

  const handleEdit = () => {
    setEditData(countdownData);
    setIsEditing(true);
    setShowSetReunion(false);
  };

  const cancelReunion = async () => {
    if (!user?.uid || !partnerId) return;
    
    try {
      const coupleId = [user.uid, partnerId].sort().join('_');
      await deleteDoc(doc(db, 'coupleReunions', coupleId));
      setShowCancelConfirm(false);
    } catch (error) {
      console.error('Error canceling reunion:', error);
      alert('Failed to cancel reunion. Please try again.');
    }
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
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading reunion data...</p>
          </div>
        ) : isGuest ? (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Sign In to Set Reunions</h3>
            <p className="text-gray-600">Create an account to set and share countdown timers with your partner</p>
          </div>
        ) : !partnerId ? (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Connect with Partner</h3>
            <p className="text-gray-600">Pair with your partner to set and share reunion countdowns together</p>
          </div>
        ) : !countdownData.date && !isEditing ? (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
            <button
              onClick={handleSetReunion}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Set Reunion</span>
            </button>
          </div>
        ) : isEditing ? (
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
                {showSetReunion ? 'Set Reunion' : 'Save Changes'}
              </button>
              {(countdownData.date || !showSetReunion) && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setShowSetReunion(false);
                    setEditData(countdownData);
                  }}
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
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200 relative">
              <div className="text-center">
                <div className="flex items-center justify-between mb-4">
                  <div></div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleEdit}
                      className="p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-100 rounded-full transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
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
              {timeLeft.days > 0 ? (
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
              ) : (
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold text-pink-600 mb-2">
                    {timeLeft.hours.toString().padStart(2, '0')}:
                    {timeLeft.minutes.toString().padStart(2, '0')}:
                    {timeLeft.seconds.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-600 uppercase tracking-wide font-medium">
                    Hours : Minutes : Seconds
                  </div>
                </div>
              )}

              {timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 && countdownData.date && (
                <div className="mt-6 text-center">
                  <div className="text-2xl font-bold text-pink-600 mb-2">🎉 Today's the day! 🎉</div>
                  <p className="text-gray-600">Hope you have an amazing time together!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Cancel Reunion?</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to cancel this reunion? This action cannot be undone.</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Keep Reunion
                </button>
                <button
                  onClick={cancelReunion}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Cancel Reunion
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}