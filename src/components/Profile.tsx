import { useState, useEffect } from 'react';
import { User, MapPin, Heart, Edit3, LogOut, Trash2, Calendar, X, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOutUser } from '../firebase/auth';
import { deleteUser } from 'firebase/auth';
import { getPartnerId } from '../firebase/moods';
import { 
  getUserProfile, 
  updateUserProfile, 
  getCoupleAnniversary, 
  setCoupleAnniversary, 
  calculateRelationshipDuration,
  deleteUserAccount,
  UserProfile as UserProfileType
} from '../firebase/profile';

interface ProfileProps {
  onPairPartner: () => void;
}

export default function Profile({ onPairPartner }: ProfileProps) {
  const { user, userProfile, isGuest } = useAuth();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<UserProfileType | null>(null);
  const [anniversary, setAnniversary] = useState<any>(null);
  const [relationshipDuration, setRelationshipDuration] = useState<any>(null);
  
  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingAnniversary, setIsEditingAnniversary] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // Form data
  const [profileData, setProfileData] = useState({
    displayName: userProfile?.displayName || '',
    location: userProfile?.location || ''
  });
  const [anniversaryDate, setAnniversaryDate] = useState('');

  // Load partner and anniversary data
  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid || isGuest) return;
      
      try {
        // Load partner ID
        const pId = await getPartnerId(user.uid);
        setPartnerId(pId);
        
        if (pId) {
          // Load partner profile
          const pProfile = await getUserProfile(pId);
          setPartnerProfile(pProfile);
          
          // Load anniversary
          const anniversaryData = await getCoupleAnniversary(user.uid, pId);
          setAnniversary(anniversaryData);
          
          if (anniversaryData) {
            setAnniversaryDate(anniversaryData.anniversaryDate);
            const duration = calculateRelationshipDuration(anniversaryData.anniversaryDate);
            setRelationshipDuration(duration);
          }
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };

    loadData();
  }, [user?.uid, isGuest]);

  // Update profile data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        displayName: userProfile.displayName || '',
        location: userProfile.location || ''
      });
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    
    try {
      const result = await updateUserProfile(user.uid, profileData);
      if (result.success) {
        setIsEditingProfile(false);
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleSaveAnniversary = async () => {
    if (!user?.uid || !partnerId) return;
    
    try {
      const result = await setCoupleAnniversary(user.uid, partnerId, anniversaryDate);
      if (result.success) {
        setIsEditingAnniversary(false);
        // Recalculate duration
        const duration = calculateRelationshipDuration(anniversaryDate);
        setRelationshipDuration(duration);
        setAnniversary({ anniversaryDate, setBy: user.uid });
      } else {
        alert('Failed to update anniversary. Please try again.');
      }
    } catch (error) {
      console.error('Error saving anniversary:', error);
      alert('Failed to update anniversary. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      // Delete from Firestore first
      await deleteUserAccount(user.uid);
      
      // Delete from Firebase Auth
      await deleteUser(user);
      
      // User will be automatically signed out
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again or contact support.');
    }
  };

  const handleLogout = () => {
    signOutUser();
  };

  const formatDuration = (duration: any) => {
    if (!duration) return '';
    
    const parts = [];
    if (duration.years > 0) parts.push(`${duration.years} year${duration.years !== 1 ? 's' : ''}`);
    if (duration.months > 0) parts.push(`${duration.months} month${duration.months !== 1 ? 's' : ''}`);
    if (duration.days > 0) parts.push(`${duration.days} day${duration.days !== 1 ? 's' : ''}`);
    
    if (parts.length === 0) return '0 days';
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return parts.join(' and ');
    return parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1];
  };

  if (isGuest) {
    return (
      <div className="p-4 md:p-6 text-center">
        <div className="max-w-md mx-auto">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Guest Mode</h2>
          <p className="text-gray-600 mb-4">Sign in to access your profile and connect with your partner</p>
          <button
            onClick={() => {}}
            className="w-full py-2 px-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Profile</h2>
        <p className="text-gray-600 text-sm md:text-base">Manage your information and relationship details</p>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Your Information</h3>
          {!isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>

        {isEditingProfile ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={profileData.displayName}
                onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Your location"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSaveProfile}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Check className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-800">{profileData.displayName || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium text-gray-800">{profileData.location || 'Not set'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Anniversary Section */}
      {partnerId && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Relationship</h3>
            {anniversary && !isEditingAnniversary && (
              <button
                onClick={() => setIsEditingAnniversary(true)}
                className="p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>

          {isEditingAnniversary ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Anniversary Date</label>
                <input
                  type="date"
                  value={anniversaryDate}
                  onChange={(e) => setAnniversaryDate(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveAnniversary}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <Check className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setIsEditingAnniversary(false)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ) : anniversary ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-pink-500" />
                <div>
                  <p className="text-sm text-gray-600">Anniversary</p>
                  <p className="font-medium text-gray-800">{new Date(anniversary.anniversaryDate).toLocaleDateString()}</p>
                </div>
              </div>
              {relationshipDuration && (
                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="text-sm text-gray-600">Together for</p>
                    <p className="font-medium text-gray-800">{formatDuration(relationshipDuration)}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-3">Set your relationship anniversary date</p>
              <button
                onClick={() => setIsEditingAnniversary(true)}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
              >
                Set Anniversary
              </button>
            </div>
          )}
        </div>
      )}

      {/* Partner Connection */}
      {!partnerId && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="text-center">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Connect with Partner</h3>
            <p className="text-gray-600 mb-4">Pair with your partner to unlock relationship features</p>
            <button
              onClick={onPairPartner}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              Pair with Partner
            </button>
          </div>
        </div>
      )}

      {/* Account Actions */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Account</h3>
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
          <button
            onClick={() => setShowDeleteConfirmation(true)}
            className="w-full flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Account</h3>
              <p className="text-gray-600">
                Are you sure you want to delete your account? This action cannot be undone and will remove all your data.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}