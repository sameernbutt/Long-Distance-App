import { useState, useEffect } from 'react';
import { User, Heart, Save, Calendar, MapPin, Users, LogIn, UserPlus, UserCheck, LogOut, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, signOutUser } from '../firebase/auth';
import { getPartnerId } from '../firebase/moods';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface CoupleProfile {
  person1: string;
  person2: string;
  relationshipStart: string;
  location1: string;
  location2: string;
  anniversaryDate: string;
  favoriteMemory: string;
}

interface ProfileProps {
  onPairPartner: () => void;
}

export default function Profile({ onPairPartner }: ProfileProps) {
  const { user, isGuest, setGuestMode } = useAuth();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  
  // Automatically set guest mode if no user is logged in
  useEffect(() => {
    if (!user && !isGuest) {
      setGuestMode(true);
    }
  }, [user, isGuest, setGuestMode]);

  // Load partner information
  useEffect(() => {
    const loadPartnerInfo = async () => {
      if (user?.uid && !isGuest) {
        try {
          const partnerIdResult = await getPartnerId(user.uid);
          setPartnerId(partnerIdResult);
          
          if (partnerIdResult) {
            // Get partner's profile
            const partnerDoc = await getDoc(doc(db, 'users', partnerIdResult));
            if (partnerDoc.exists()) {
              setPartnerProfile(partnerDoc.data());
            }
          }
        } catch (error) {
          console.error('Error loading partner info:', error);
        }
      }
    };

    loadPartnerInfo();
  }, [user, isGuest]);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', displayName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [profile, setProfile] = useState<CoupleProfile>(() => {
    const saved = localStorage.getItem('coupleProfile');
    return saved ? JSON.parse(saved) : {
      person1: '',
      person2: '',
      relationshipStart: '',
      location1: '',
      location2: '',
      anniversaryDate: '',
      favoriteMemory: ''
    };
  });

  const saveProfile = () => {
    localStorage.setItem('coupleProfile', JSON.stringify(profile));
    const names = { person1: profile.person1, person2: profile.person2 };
    localStorage.setItem('coupleNames', JSON.stringify(names));
  };

  const calculateRelationshipDays = () => {
    if (!profile.relationshipStart) return 0;
    const startDate = new Date(profile.relationshipStart);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getNextAnniversary = () => {
    if (!profile.anniversaryDate) return null;
    
    const today = new Date();
    const thisYear = new Date(profile.anniversaryDate);
    thisYear.setFullYear(today.getFullYear());
    
    if (thisYear < today) {
      thisYear.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = thisYear.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      date: thisYear.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      days: diffDays
    };
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await signInWithEmail(loginForm.email, loginForm.password);
    
    if (result.error) {
      setError(result.error);
    } else {
      setShowLogin(false);
      setLoginForm({ email: '', password: '' });
    }
    
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await signUpWithEmail(signupForm.email, signupForm.password, signupForm.displayName);
    
    if (result.error) {
      setError(result.error);
    } else {
      setShowSignup(false);
      setSignupForm({ email: '', password: '', displayName: '' });
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    const result = await signInWithGoogle();
    
    if (result.error) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOutUser();
  };

  const handleGuestMode = () => {
    setGuestMode(true);
  };

  const relationshipDays = calculateRelationshipDays();
  const nextAnniversary = getNextAnniversary();


  return (
    <div className="p-4 md:p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Profile</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Manage your account and relationship</p>
      </div>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Authentication Section */}
        {!user && !isGuest ? (
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-100">
            <div className="text-center mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-fit mx-auto mb-3">
                <LogIn className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Get Started</h3>
              <p className="text-sm text-gray-600">Sign in to sync your data or continue as guest</p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => setShowLogin(true)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-medium text-sm"
              >
                Sign In
              </button>
              
              <button 
                onClick={() => setShowSignup(true)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium text-sm"
              >
                Create Account
              </button>
              
              <button 
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-medium text-sm disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Continue with Google'}
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
              
              <button 
                onClick={handleGuestMode}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 font-medium text-sm shadow-lg"
              >
                🎉 Continue as Guest
              </button>
            </div>
          </div>
        ) : (
          /* User Info Section */
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-100">
            <div className="text-center mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-fit mx-auto mb-3">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {isGuest ? 'Guest Mode' : 'Signed In'}
              </h3>
              <p className="text-sm text-gray-600">
                {isGuest ? 'You can use the app without an account' : `Welcome back, ${user?.displayName || user?.email}!`}
              </p>
            </div>
            
            {!isGuest && (
              <button 
                onClick={handleLogout}
                className="w-full py-2.5 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium text-sm"
              >
                <LogOut className="w-4 h-4 inline mr-2" />
                Sign Out
              </button>
            )}
            
            {isGuest && (
              <button 
                onClick={() => setGuestMode(false)}
                className="w-full py-2.5 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium text-sm"
              >
                Sign In Instead
              </button>
            )}
          </div>
        )}

        {/* Partner Pairing Section */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-100">
          <div className="text-center mb-4">
            <div className={`p-3 rounded-full w-fit mx-auto mb-3 ${partnerId ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-pink-500 to-purple-500'}`}>
              {partnerId ? <UserCheck className="w-6 h-6 text-white" /> : <UserPlus className="w-6 h-6 text-white" />}
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Partner Connection</h3>
            <p className="text-sm text-gray-600">
              {isGuest 
                ? 'Sign in to connect with your partner' 
                : partnerId 
                  ? `You're paired with ${partnerProfile?.displayName || 'your partner'}!`
                  : 'Connect with your partner to share experiences'
              }
            </p>
          </div>
          <div className="space-y-3">
            {partnerId ? (
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-center space-x-2 text-green-700">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Connected with {partnerProfile?.displayName || 'Partner'}
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  You can now share moods, daily questions, and more!
                </p>
              </div>
            ) : (
              <button 
                onClick={onPairPartner}
                disabled={isGuest}
                className={`w-full py-2.5 px-4 rounded-lg transition-all duration-200 font-medium text-sm ${
                  isGuest 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
                }`}
              >
                {isGuest ? 'Sign in to pair with partner' : 'Pair with Partner'}
              </button>
            )}
            {profile.person2 && !isGuest && !partnerId && (
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center space-x-2 text-blue-700">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Profile shows: {profile.person2}</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Use "Pair with Partner" to connect digitally
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-100">
          <div className="grid gap-6">
            {/* Names */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Person's Name
                </label>
                <input
                  type="text"
                  value={profile.person1}
                  onChange={(e) => setProfile(prev => ({ ...prev, person1: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partner's Name
                </label>
                <input
                  type="text"
                  value={profile.person2}
                  onChange={(e) => setProfile(prev => ({ ...prev, person2: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Partner's name"
                />
              </div>
            </div>

            {/* Locations */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Location
                </label>
                <input
                  type="text"
                  value={profile.location1}
                  onChange={(e) => setProfile(prev => ({ ...prev, location1: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="City, Country"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partner's Location
                </label>
                <input
                  type="text"
                  value={profile.location2}
                  onChange={(e) => setProfile(prev => ({ ...prev, location2: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship Start Date
                </label>
                <input
                  type="date"
                  value={profile.relationshipStart}
                  onChange={(e) => setProfile(prev => ({ ...prev, relationshipStart: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anniversary Date
                </label>
                <input
                  type="date"
                  value={profile.anniversaryDate}
                  onChange={(e) => setProfile(prev => ({ ...prev, anniversaryDate: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Favorite Memory */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favorite Memory Together
              </label>
              <textarea
                value={profile.favoriteMemory}
                onChange={(e) => setProfile(prev => ({ ...prev, favoriteMemory: e.target.value }))}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Share a special memory from your relationship..."
              />
            </div>
          </div>

          <button
            onClick={saveProfile}
            className="w-full mt-6 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-medium"
          >
            <Save className="w-5 h-5" />
            <span>Save Profile</span>
          </button>
        </div>

        {/* Relationship Stats */}
        {(profile.person1 || profile.person2 || profile.relationshipStart) && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {relationshipDays > 0 && (
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-200">
                <div className="text-center">
                  <Calendar className="w-8 h-8 text-pink-500 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-pink-600 mb-1">{relationshipDays}</div>
                  <div className="text-sm text-gray-600">Days Together</div>
                </div>
              </div>
            )}

            {nextAnniversary && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                <div className="text-center">
                  <Heart className="w-8 h-8 text-purple-500 fill-current mx-auto mb-3" />
                  <div className="text-3xl font-bold text-purple-600 mb-1">{nextAnniversary.days}</div>
                  <div className="text-sm text-gray-600">Days to Anniversary</div>
                  <div className="text-xs text-gray-500 mt-1">{nextAnniversary.date}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Summary */}
        {profile.person1 && profile.person2 && (
          <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 rounded-xl p-6 border border-pink-200">
            <div className="text-center mb-4">
              <div className="flex justify-center items-center space-x-4 mb-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mb-2">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-semibold text-gray-800">{profile.person1}</p>
                  {profile.location1 && (
                    <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{profile.location1}</span>
                    </div>
                  )}
                </div>
                
                <Heart className="w-8 h-8 text-pink-500 fill-current" />
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center mb-2">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-semibold text-gray-800">{profile.person2}</p>
                  {profile.location2 && (
                    <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{profile.location2}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {profile.favoriteMemory && (
              <div className="bg-white/70 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Favorite Memory</h4>
                <p className="text-gray-700 text-sm italic">"{profile.favoriteMemory}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Sign In</h3>
              <p className="text-sm text-gray-600">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Create Account</h3>
              <p className="text-sm text-gray-600">Sign up to sync your data across devices</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                <input
                  type="text"
                  value={signupForm.displayName}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={signupForm.password}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Create a password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSignup(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}