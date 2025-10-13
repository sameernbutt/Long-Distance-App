import { useState, useEffect } from 'react';
import { Calendar, Heart, Edit, Plus, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPartnerId } from '../firebase/moods';
import { 
  setCoupleDateNight, 
  subscribeToDateNightChanges, 
  deleteCoupleDateNight,
  DateNight,
  BucketListItem,
  subscribeToSharedBucketList
} from '../firebase/dates';

interface DateNightData {
  activity: string;
  datetime: string;
}

export default function DateNightCountdown() {
  const { user, isGuest, userProfile } = useAuth();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [dateNightData, setDateNightData] = useState<DateNightData>({
    activity: '',
    datetime: ''
  });
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [showSetDateNight, setShowSetDateNight] = useState(false);
  const [editData, setEditData] = useState(dateNightData);
  const [loading, setLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [bucketList, setBucketList] = useState<BucketListItem[]>([]);
  const [showBucketList, setShowBucketList] = useState(false);

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

  // Load and subscribe to date night data
  useEffect(() => {
    if (!user?.uid || !partnerId || isGuest) {
      setLoading(false);
      return;
    }

    // Subscribe to real-time updates
    const unsubscribe = subscribeToDateNightChanges(user.uid, partnerId, (dateNight: DateNight | null) => {
      if (dateNight) {
        setDateNightData({
          activity: dateNight.activity,
          datetime: dateNight.datetime
        });
        setEditData({
          activity: dateNight.activity,
          datetime: dateNight.datetime
        });
      } else {
        setDateNightData({
          activity: '',
          datetime: ''
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, partnerId, isGuest]);

  // Subscribe to bucket list for activity selection
  useEffect(() => {
    if (!user?.uid || !partnerId || isGuest) return;

    const unsubscribe = subscribeToSharedBucketList(user.uid, partnerId, (items: BucketListItem[]) => {
      setBucketList(items);
    });

    return () => unsubscribe();
  }, [user?.uid, partnerId, isGuest]);

  // Update countdown timer
  useEffect(() => {
    if (!dateNightData.datetime) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const targetDate = new Date(dateNightData.datetime).getTime();
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
  }, [dateNightData.datetime]);

  const handleSave = async () => {
    if (!user?.uid || !partnerId || !userProfile?.displayName) return;
    
    if (!editData.activity.trim() || !editData.datetime) {
      alert('Please fill in all fields');
      return;
    }

    const result = await setCoupleDateNight(
      user.uid,
      partnerId,
      userProfile.displayName,
      {
        activity: editData.activity.trim(),
        datetime: editData.datetime
      }
    );

    if (result.success) {
      setIsEditing(false);
      setShowSetDateNight(false);
    } else {
      alert('Failed to save date night. Please try again.');
    }
  };

  const handleCancel = async () => {
    if (!user?.uid || !partnerId) return;
    
    const result = await deleteCoupleDateNight(user.uid, partnerId);
    
    if (result.success) {
      setShowCancelConfirm(false);
    } else {
      alert('Failed to cancel date night. Please try again.');
    }
  };

  const handleBucketListSelect = (item: BucketListItem) => {
    setEditData({ ...editData, activity: item.title });
    setShowBucketList(false);
  };

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isGuest) {
    return (
      <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-xl mb-6">
        <div className="text-center">
          <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Date Night Countdown</h2>
          <p className="text-gray-600">Create an account to plan date nights with your partner!</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-xl mb-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading date night...</p>
        </div>
      </div>
    );
  }

  if (!partnerId) {
    return (
      <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-xl mb-6">
        <div className="text-center">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Date Night Countdown</h2>
          <p className="text-gray-600">Connect with your partner to plan date nights together!</p>
        </div>
      </div>
    );
  }

  const hasActiveCountdown = dateNightData.activity && dateNightData.datetime;

  return (
    <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-xl mb-6">
      {hasActiveCountdown ? (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-pink-500" />
            <h2 className="text-2xl font-bold text-gray-800">Date Night Countdown</h2>
          </div>
          
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{dateNightData.activity}</h3>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDateTime(dateNightData.datetime)}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white/60 rounded-lg p-3">
              <div className="text-2xl font-bold text-pink-600">{timeLeft.days}</div>
              <div className="text-sm text-gray-600">Days</div>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <div className="text-2xl font-bold text-pink-600">{timeLeft.hours}</div>
              <div className="text-sm text-gray-600">Hours</div>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <div className="text-2xl font-bold text-pink-600">{timeLeft.minutes}</div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <div className="text-2xl font-bold text-pink-600">{timeLeft.seconds}</div>
              <div className="text-sm text-gray-600">Seconds</div>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                setEditData(dateNightData);
                setIsEditing(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Plan Your Next Date Night</h2>
          <p className="text-gray-600 mb-4">Set a countdown for your next virtual date!</p>
          <button
            onClick={() => setShowSetDateNight(true)}
            className="flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors mx-auto"
          >
            <Plus className="w-5 h-5" />
            Plan Date Night
          </button>
        </div>
      )}

      {/* Set/Edit Date Night Modal */}
      {(showSetDateNight || isEditing) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {isEditing ? 'Edit Date Night' : 'Plan Date Night'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editData.activity}
                    onChange={(e) => setEditData({ ...editData, activity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="What are you planning to do?"
                  />
                  {bucketList.length > 0 && (
                    <button
                      onClick={() => setShowBucketList(!showBucketList)}
                      className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {showBucketList && bucketList.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                    <div className="p-2 text-xs font-medium text-gray-500 border-b">
                      Select from Bucket List:
                    </div>
                    {bucketList.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleBucketListSelect(item)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={editData.datetime}
                  onChange={(e) => setEditData({ ...editData, datetime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setShowSetDateNight(false);
                  setShowBucketList(false);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Cancel Date Night?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to cancel this date night? This action cannot be undone.</p>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Date Night
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Cancel Date Night
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}