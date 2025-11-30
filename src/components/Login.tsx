import { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, LogIn, User } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../firebase/auth';

interface LoginProps {
  onBack: () => void;
  onSuccess: () => void;
  isDarkMode?: boolean;
}

export default function Login({ onBack, onSuccess, isDarkMode = false }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await signInWithEmail(email, password);
      } else {
        if (!displayName.trim()) {
          setError('Display name is required');
          setLoading(false);
          return;
        }
        result = await signUpWithEmail(email, password, displayName);
      }

      if (result.error) {
        setError(result.error);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setError(result.error);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${
      isDarkMode 
        ? 'bg-gray-900' 
        : 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50'
    }`}>
      {/* Header */}
      <div className={`backdrop-blur-md border-b sticky top-0 z-40 safe-area-top transition-colors ${
        isDarkMode 
          ? 'bg-black/80 border-purple-900' 
          : 'bg-white/80 border-pink-200'
      }`}>
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className={`p-2 rounded-xl transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-pink-400 hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-pink-600 hover:bg-pink-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <LogIn className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-bold transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {isLogin ? 'Sign In' : 'Sign Up'}
              </h1>
              <p className={`text-xs transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {isLogin ? 'Welcome back!' : 'Create your account'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        <div className="max-w-md mx-auto">
          {/* Toggle Login/Signup */}
          <div className={`rounded-xl p-1 shadow-lg border-2 mb-6 transition-colors ${
            isDarkMode 
              ? 'bg-black border-purple-900' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="grid grid-cols-2">
              <button
                onClick={() => setIsLogin(true)}
                className={`py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                  isLogin
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : isDarkMode 
                      ? 'text-gray-400 hover:text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                  !isLogin
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : isDarkMode 
                      ? 'text-gray-400 hover:text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`rounded-xl p-3 mb-4 border-2 transition-colors ${
              isDarkMode 
                ? 'bg-red-900/30 border-red-800 text-red-300' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className={`rounded-xl p-4 md:p-6 shadow-lg border-2 transition-colors ${
              isDarkMode 
                ? 'bg-black border-purple-900' 
                : 'bg-white border-gray-100'
            }`}>
              {!isLogin && (
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Display Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className={`w-full p-3 pl-10 border-2 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                        isDarkMode 
                          ? 'bg-black border-purple-900 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Enter your name"
                      required={!isLogin}
                    />
                    <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-3 pl-10 border-2 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                      isDarkMode 
                        ? 'bg-black border-purple-900 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter your email"
                    required
                  />
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                </div>
              </div>

              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full p-3 pl-10 pr-10 border-2 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                      isDarkMode 
                        ? 'bg-black border-purple-900 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter your password"
                    required
                  />
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                      isDarkMode 
                        ? 'text-gray-500 hover:text-gray-300' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className={`flex-1 border-t transition-colors ${
              isDarkMode ? 'border-purple-900' : 'border-gray-200'
            }`}></div>
            <span className={`px-4 text-sm transition-colors ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>or</span>
            <div className={`flex-1 border-t transition-colors ${
              isDarkMode ? 'border-purple-900' : 'border-gray-200'
            }`}></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className={`w-full py-3 px-4 border-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2 ${
              isDarkMode 
                ? 'bg-black border-purple-900 text-white hover:bg-gray-900' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Terms */}
          <p className={`text-xs text-center mt-6 transition-colors ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
