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
  LogOut,
  Bell,
  Moon,
  Sun
} from 'lucide-react';

// Import all components
import Countdown from './components/Countdown';
import DailyQuestions from './components/DailyQuestions';
import Games from './components/Games';
import MusicSharing from './components/MusicSharing';
import MediaGallery from './components/MediaGallery';
import Profile from './components/Profile';
import VirtualDates from './components/VirtualDates';
import Help from './components/Help';
import Feedback from './components/Feedback';
import Login from './components/Login';
import PartnerPairing from './components/PartnerPairing';
import MoodSharing from './components/MoodSharing';

import FeedShareMenu from './components/FeedShareMenu';
import FeedList from './components/FeedList';
// import { useAuth } from './contexts/AuthContext';
import { getPartnerId } from './firebase/moods';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
// Import contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { signOutUser } from './firebase/auth';
import { requestNotificationPermission, sendThinkingOfYouNotification } from './firebase/messaging';
import { saveDarkModePreference, getDarkModePreference } from './firebase/profile';

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
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [sendingNotification, setSendingNotification] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Touch events for swipe to close menu
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    
    if (isLeftSwipe && isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  // Keyboard support - close menu with Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

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

  // Load partner information
  useEffect(() => {
    const loadPartnerInfo = async () => {
      if (user?.uid) {
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
  }, [user]);

  // Check notification permission on load
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Load dark mode preference when user logs in
  useEffect(() => {
    const loadDarkModePreference = async () => {
      if (user?.uid) {
        try {
          const preference = await getDarkModePreference(user.uid);
          if (preference !== null) {
            setIsDarkMode(preference);
            // Update theme color for mobile status bar
            const themeColorMeta = document.querySelector('meta[name="theme-color"]');
            if (themeColorMeta) {
              themeColorMeta.setAttribute('content', preference ? '#000000' : '#ffffff');
            }
          }
        } catch (error) {
          console.error('Error loading dark mode preference:', error);
        }
      } else {
        // For guests, set theme color based on current dark mode state
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
          themeColorMeta.setAttribute('content', isDarkMode ? '#000000' : '#ffffff');
        }
      }
    };

    loadDarkModePreference();
  }, [user?.uid, isDarkMode]);

  // Save dark mode preference when it changes
  const handleDarkModeToggle = async () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Update theme color for mobile status bar
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', newDarkMode ? '#000000' : '#ffffff');
    }
    
    if (user?.uid) {
      try {
        await saveDarkModePreference(user.uid, newDarkMode);
      } catch (error) {
        console.error('Error saving dark mode preference:', error);
      }
    }
  };

  // Request notification permission
  const requestPermission = async () => {
    try {
      // Check if we're on iOS Safari
      const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|OPiOS|mercury/.test(navigator.userAgent);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
      
      console.log('Debug info:', {
        userAgent: navigator.userAgent,
        isIOSSafari,
        isStandalone,
        displayMode: window.matchMedia('(display-mode: standalone)').matches,
        standalone: (window.navigator as any).standalone
      });
      
      if (isIOSSafari) {
        // Check if the app is running as a PWA (installed to home screen)
        if (!isStandalone) {
          alert('To enable notifications on iPhone:\n\n1. Tap the Share button (square with arrow up)\n2. Select "Add to Home Screen"\n3. Open the app from your home screen\n4. Try enabling notifications again\n\nThis is required for iPhone notifications to work.');
          return;
        }
      }
      
      console.log('Attempting to request notification permission...');
      const token = await requestNotificationPermission();
      console.log('Permission result:', token);
      
      if (token) {
        setNotificationPermission('granted');
        alert('Notifications enabled! You can now send sweet messages to your partner.');
      } else {
        setNotificationPermission('denied');
        if (isIOSSafari) {
          alert('Notification permission denied. Make sure you:\n\n1. Installed the app to your home screen\n2. Opened it from the home screen (not Safari)\n3. Try again from the home screen app');
        } else {
          alert('Notification permission denied. Please enable notifications in your browser settings.');
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      alert('Failed to enable notifications. Please try again.');
    }
  };

  // Send "thinking of you" notification
  const sendNotification = async () => {
    if (!user?.uid || !partnerId || !userProfile) return;

    setSendingNotification(true);
    try {
      const result = await sendThinkingOfYouNotification(
        user.uid,
        partnerId,
        userProfile.displayName || 'Your partner'
      );

      if (result.success) {
        alert('Sweet message sent! Your partner will be notified that you\'re thinking of them.');
      } else {
        alert('Failed to send notification. Please try again.');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification. Please try again.');
    } finally {
      setSendingNotification(false);
    }
  };

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full w-fit mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white fill-current" />
          </div>
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
          <div className="space-y-4">
            {/* Relationship Status Header */}
            <div className="text-center py-2">
              {partnerId && partnerProfile && userProfile ? (
                <div className={`inline-flex items-center space-x-2 px-4 py-2 ${
                      isDarkMode ? 'bg-black rounded-full border border-pink-900' : 'bg-gradient-to-r from-pink-50 to-purple-50 rounded-full border border-pink-200'
                    }`}>
                  <Heart className={`w-4 h-4 text-pink-500 fill-current`} />
                  <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                    {userProfile.displayName || 'You'} & {partnerProfile.displayName || 'Partner'}
                  </span>
                  <Heart className={`w-4 h-4 text-pink-500 fill-current`} />
                </div>
              ) : (
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-50 rounded-full border border-yellow-200">
                  <span className="text-sm font-medium text-yellow-800">
                    Pair with your partner to unlock more features
                  </span>
                </div>
              )}
            </div>
            <MoodSharing isDarkMode={isDarkMode} />
            <Countdown isDarkMode={isDarkMode} />
            <DailyQuestions isDarkMode={isDarkMode} />
            
            {/* Notification Button */}
            {partnerId && (
              <div className="px-4 md:px-6">
                <div className="max-w-2xl mx-auto">
                  <div className={`rounded-xl p-4 md:p-6 shadow-lg border-2 text-center transition-colors ${
                    isDarkMode 
                      ? 'bg-black border-pink-900' 
                      : 'bg-white border-gray-100'
                  }`}>
                    <Bell className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                    <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>Send a Sweet Message</h3>
                    <p className={`mb-4 transition-colors ${
                      isDarkMode ? 'text-pink-100 text-sm' : 'text-gray-600 text-sm'
                    }`}>Let your partner know you're thinking about them</p>

                    {notificationPermission === 'granted' ? (
                      <button
                        onClick={sendNotification}
                        disabled={sendingNotification}
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                      >
                        {sendingNotification ? 'Sending...' : 'Send "Thinking of You" Notification'}
                      </button>
                    ) : (
                      <button
                        onClick={requestPermission}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-medium"
                      >
                        Enable Notifications
                      </button>
                    )}
                    
                    {notificationPermission === 'denied' && (
                      <p className="text-sm text-red-600 mt-2">
                        Notifications are blocked. Please enable them in your browser settings.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'activities':
        return (
          <div className="space-y-6">
            <Games isDarkMode={isDarkMode} />
          </div>
        );
      case 'profile':
        return <Profile onPairPartner={() => setShowPartnerPairing(true)} isDarkMode={isDarkMode} />;

      case 'feed':
        return (
          <FeedPage isDarkMode={isDarkMode} />
        );

// FeedPage component for the feed tab


function FeedPage({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const [showPhotoVideo, setShowPhotoVideo] = useState(false);
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
        <h2 className={`text-2xl font-bold mb-2 transition-colors ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>Your Shared Feed</h2>
        <p className={`max-w-md mx-auto transition-colors ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Photos, videos, and music links that you and your partner share will appear here. Start sharing your moments!
        </p>
      </div>
      <FeedShareMenu
        onSharePhotoVideo={() => setShowPhotoVideo(true)}
        onShareMusic={() => setShowMusic(true)}
        isDarkMode={isDarkMode}
      />
      <div className="mt-8 w-full">
        {partnerId && <FeedList partnerId={partnerId} isDarkMode={isDarkMode} />}
      </div>

      {/* Modals for sharing */}
      {showPhotoVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className={`rounded-xl shadow-xl p-4 w-full max-w-md relative border-2 ${
            isDarkMode ? 'bg-black border-pink-900' : 'bg-white border-gray-200'
          }`}>
            <button className={`absolute top-2 right-2 z-10 transition-colors ${
              isDarkMode ? 'text-gray-400 hover:text-pink-400' : 'text-gray-400 hover:text-pink-500'
            }`} onClick={() => setShowPhotoVideo(false)}>
              <X className="w-5 h-5" />
            </button>
            <MediaGallery />
          </div>
        </div>
      )}
      {showMusic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className={`rounded-xl shadow-xl p-4 w-full max-w-md relative border-2 ${
            isDarkMode ? 'bg-black border-blue-900' : 'bg-white border-gray-200'
          }`}>
            <button className={`absolute top-2 right-2 transition-colors ${
              isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-400 hover:text-blue-500'
            }`} onClick={() => setShowMusic(false)}>
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
        return <VirtualDates isDarkMode={isDarkMode} />;
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
    return 'Lovespark';
  };

  return (
    <div className={`min-h-screen safe-area-top safe-area-bottom transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-black' 
        : 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-md border-b sticky top-0 z-40 safe-area-top transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-black/80 border-purple-900' 
          : 'bg-white/80 border-pink-200'
      }`}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-xl transition-colors inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95 ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700 focus-visible:ring-purple-500' 
                  : 'text-gray-700 hover:bg-gray-100 focus-visible:ring-pink-500'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
                <Heart className="w-6 h-6 text-white fill-current" />
              </div>
              <div>
                <h1 className={`text-lg font-bold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>{getAppTitle()}</h1>
                <p className={`text-xs transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Long Distance Love</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${isMenuOpen ? 'visible' : 'invisible'}`}>
        {/* Background overlay */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Sliding menu */}
        <div 
          className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] shadow-xl transform transition-transform duration-300 ease-out border-r-2 ${
            isDarkMode ? 'bg-black border-purple-900' : 'bg-white'
          } ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`p-4 border-b transition-colors ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
                  <Heart className="w-5 h-5 text-white fill-current" />
                </div>
                <div>
                  <h2 className={`text-lg font-bold transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>{getAppTitle()}</h2>
                  <p className="text-sm text-gray-600">Long Distance Love</p>
                  {user && userProfile && (
                    <p className="text-xs text-pink-600 font-medium">
                      Hi {userProfile.displayName}!
                    </p>
                  )}
                </div>
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
                          : 'text-black hover:bg-gray-100'
                      } ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <Icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : 'text-gray-500'}`} />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              
              <div className={`mt-6 pt-4 border-t transition-colors ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      setShowHelp(true);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <HelpCircle className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className="text-sm font-medium">Help</span>
                  </button>
                  <button 
                    onClick={() => {
                      setShowFeedback(true);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <MessageSquare className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className="text-sm font-medium">Feedback</span>
                  </button>
                  <button 
                    onClick={handleDarkModeToggle}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {isDarkMode ? (
                      <Sun className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    ) : (
                      <Moon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    )}
                    <span className="text-sm font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                  {user ? (
                    <button 
                      onClick={handleLogout}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 text-red-600 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                      }`}
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
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <LogIn className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className="text-sm font-medium">Login</span>
                    </button>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-20 md:pb-6">
        {renderContent()}
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className={`fixed bottom-0 left-0 right-0 border-t z-30 safe-area-bottom md:hidden transition-colors ${
        isDarkMode 
          ? 'bg-black border-gray-800' 
          : 'bg-white border-pink-200'
      }`}>
        <div className="grid grid-cols-5 gap-1 px-1 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center space-y-1 py-2 px-1 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? isDarkMode 
                      ? 'bg-pink-600 text-white'
                      : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-pink-400'
                      : 'text-gray-600 hover:text-pink-600'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : ''}`} />
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
            {/* {tabs.map((tab) => {
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
            })} */}
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
