import { useState, useEffect } from 'react';
import { 
  Heart, 
  User, 
  Menu,
  X,
  Home,
  Activity,
  Rss,
  HelpCircle,
  MessageSquare,
  LogIn,
  LogOut
} from 'lucide-react';

// Import all components
import Countdown from './components/Countdown';
import DailyQuestions from './components/DailyQuestions';
import Games from './components/Games';
import MusicSharing from './components/MusicSharing';
import PhotoGallery from './components/PhotoGallery';
import Profile from './components/Profile';
import VirtualDates from './components/VirtualDates';
import Help from './components/Help';
import Feedback from './components/Feedback';
import Login from './components/Login';
import PartnerPairing from './components/PartnerPairing';
import MoodSharing from './components/MoodSharing';
import VideoSharing from './components/VideoSharing';


import FeedShareMenu from './components/FeedShareMenu';
import FeedList from './components/FeedList';
// import { useAuth } from './contexts/AuthContext';
import { getPartnerId } from './firebase/moods';
// Import contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { signOutUser } from './firebase/auth';

type TabType = 'home' | 'activities' | 'profile' | 'feed' | 'dates';

const tabs = [
  { id: 'home' as TabType, label: 'Home', icon: Home, color: 'text-pink-500' },
  { id: 'activities' as TabType, label: 'Activities', icon: Activity, color: 'text-blue-500' },
  { id: 'profile' as TabType, label: 'Profile', icon: User, color: 'text-purple-500' },
  { id: 'feed' as TabType, label: 'Feed', icon: Rss, color: 'text-green-500' },
  { id: 'dates' as TabType, label: 'Dates', icon: Heart, color: 'text-red-500' },
];

function AppContent() {
  const { user, userProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showPartnerPairing, setShowPartnerPairing] = useState(false);
  const [coupleNames, setCoupleNames] = useState({ person1: '', person2: '' });

  useEffect(() => {
    const saved = localStorage.getItem('coupleNames');
    if (saved) {
      setCoupleNames(JSON.parse(saved));
    }

    // Check for pairing code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const pairCode = urlParams.get('pairCode');
    
    if (pairCode && user) {
      // Automatically open partner pairing with the code
      setShowPartnerPairing(true);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOutUser();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading screen while checking authentication (only briefly)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full w-fit mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white fill-current" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login modal if requested (but don't block app access)
  if (showLogin) {
    return <Login onBack={() => setShowLogin(false)} onSuccess={() => setShowLogin(false)} />;
  }

  // Show specific screens
  if (showHelp) {
    return <Help onBack={() => setShowHelp(false)} />;
  }

  if (showFeedback) {
    return <Feedback onBack={() => setShowFeedback(false)} />;
  }

  if (showPartnerPairing) {
    return (
      <PartnerPairing 
        onBack={() => setShowPartnerPairing(false)} 
        onSuccess={() => setShowPartnerPairing(false)}
        userId={user?.uid || 'guest'}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            <MoodSharing />
            <Countdown />
            <DailyQuestions />
          </div>
        );
      case 'activities':
        return (
          <div className="space-y-6">
            <Games />
          </div>
        );
      case 'profile':
        return <Profile onPairPartner={() => setShowPartnerPairing(true)} />;

      case 'feed':
        return (
          <FeedPage />
        );

// FeedPage component for the feed tab


function FeedPage() {
  const [showPhoto, setShowPhoto] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const { user } = useAuth();
  const [partnerId, setPartnerId] = useState<string>('');

  useEffect(() => {
    if (user) {
      getPartnerId(user.uid).then((id) => setPartnerId(id || ''));
    }
  }, [user]);

  return (
    <div className="relative flex flex-col items-center min-h-[60vh] px-4 py-10">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Shared Feed</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Photos, videos, and music links that you and your partner share will appear here. Start sharing your moments!
        </p>
      </div>
      <FeedShareMenu
        onSharePhoto={() => setShowPhoto(true)}
        onShareVideo={() => setShowVideo(true)}
        onShareMusic={() => setShowMusic(true)}
      />
      <div className="mt-8 w-full">
        {partnerId && <FeedList partnerId={partnerId} />}
      </div>

      {/* Modals for sharing */}
      {showPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-4 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-pink-500" onClick={() => setShowPhoto(false)}>
              <X className="w-5 h-5" />
            </button>
            <PhotoGallery />
          </div>
        </div>
      )}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-4 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-purple-500" onClick={() => setShowVideo(false)}>
              <X className="w-5 h-5" />
            </button>
            <VideoSharing />
          </div>
        </div>
      )}
      {showMusic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-4 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-blue-500" onClick={() => setShowMusic(false)}>
              <X className="w-5 h-5" />
            </button>
            <MusicSharing />
          </div>
        </div>
      )}
    </div>
  );
}
      case 'dates':
        return <VirtualDates />;
      default:
        return (
          <div className="space-y-6">
            <Countdown />
            <DailyQuestions />
          </div>
        );
    }
  };

  const getAppTitle = () => {
    if (coupleNames.person1 && coupleNames.person2) {
      return `${coupleNames.person1} & ${coupleNames.person2}`;
    }
    return 'Together Apart';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-200 sticky top-0 z-40 safe-area-top">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
                <Heart className="w-6 h-6 text-white fill-current" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">{getAppTitle()}</h1>
                <p className="text-xs text-gray-600">Long Distance Love</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-100 rounded-xl transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsMenuOpen(false)}>
          <div className="bg-white h-full w-80 max-w-[85vw] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
                    <Heart className="w-5 h-5 text-white fill-current" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{getAppTitle()}</h2>
                    <p className="text-sm text-gray-600">Long Distance Love</p>
                    {user && userProfile && (
                      <p className="text-xs text-pink-600 font-medium">
                        Hi {userProfile.displayName}!
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <nav className="p-4">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : 'text-gray-500'}`} />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      setShowHelp(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Help</span>
                  </button>
                  <button 
                    onClick={() => {
                      setShowFeedback(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Feedback</span>
                  </button>
                  {user ? (
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setShowLogin(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <LogIn className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Login</span>
                    </button>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pb-20 md:pb-6">
        {renderContent()}
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-pink-200 z-30 safe-area-bottom md:hidden">
        <div className="grid grid-cols-5 gap-1 px-1 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center space-y-1 py-2 px-1 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700'
                    : 'text-gray-600 hover:text-pink-600'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ''}`} />
                <span className="text-xs font-medium leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar - Hidden on Mobile */}
      <aside className="hidden md:block fixed left-0 top-0 h-full w-64 bg-white/90 backdrop-blur-md border-r border-pink-200 z-30 safe-area-top">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
                <Heart className="w-5 h-5 text-white fill-current" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">{getAppTitle()}</h2>
                <p className="text-sm text-gray-600">Long Distance Love</p>
                {user && userProfile && (
                  <p className="text-xs text-pink-600 font-medium">
                    Hi {userProfile.displayName}!
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <nav className="p-4">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : 'text-gray-500'}`} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="space-y-1">
              <button 
                onClick={() => setShowHelp(true)}
                className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Help</span>
              </button>
              <button 
                onClick={() => setShowFeedback(true)}
                className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Feedback</span>
              </button>
              {user ? (
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              ) : (
                <button 
                  onClick={() => setShowLogin(true)}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Login</span>
                </button>
              )}
            </div>
          </div>
        </nav>
      </aside>

      {/* Desktop Main Content Offset */}
      <div className="hidden md:block md:ml-64">
        <main className="min-h-screen">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
