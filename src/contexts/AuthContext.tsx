import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChange, getUserProfile, UserProfile } from '../firebase/auth';

interface AuthContextType {
  user: any | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isGuest: boolean;
  setGuestMode: (isGuest: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  error: null,
  isGuest: false,
  setGuestMode: () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  const setGuestMode = (guestMode: boolean) => {
    setIsGuest(guestMode);
    if (guestMode) {
      setUser(null);
      setUserProfile(null);
      setError(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (!isGuest) {
        setUser(user);
        setError(null);
        
        if (user) {
          try {
            const profile = await getUserProfile(user.uid);
            setUserProfile(profile);
          } catch (err) {
            console.error('Error fetching user profile:', err);
            setError('Failed to load user profile');
          }
        } else {
          setUserProfile(null);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isGuest]);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, error, isGuest, setGuestMode }}>
      {children}
    </AuthContext.Provider>
  );
};
