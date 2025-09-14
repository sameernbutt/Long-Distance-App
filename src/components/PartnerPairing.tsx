import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Copy, Check, UserPlus, Link } from 'lucide-react';
import { createPartnerConnection, joinPartnerConnection } from '../firebase/partners';

interface PartnerPairingProps {
  onBack: () => void;
  onSuccess: () => void;
  userId: string;
}

export default function PartnerPairing({ onBack, onSuccess, userId }: PartnerPairingProps) {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [partnerCode, setPartnerCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Check for URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pairCode = urlParams.get('pairCode');
    
    if (pairCode) {
      setMode('join');
      setPartnerCode(pairCode.toUpperCase());
    }
  }, []);

  const generateCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const result = await createPartnerConnection(userId, code);
      
      if (result.error) {
        setError(result.error);
      } else {
        setGeneratedCode(code);
        // Generate shareable link
        const baseUrl = window.location.origin;
        const shareLink = `${baseUrl}?pairCode=${code}`;
        setGeneratedLink(shareLink);
        setSuccess('Partner code and link generated! Share either with your partner.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const joinWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await joinPartnerConnection(userId, partnerCode);
      
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Successfully connected with your partner!');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to join partner');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-pink-200 sticky top-0 z-40 safe-area-top">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Pair with Partner</h1>
              <p className="text-xs text-gray-600">Connect with your significant other</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Mode Toggle */}
          <div className="bg-white rounded-xl p-1 shadow-lg border border-gray-100">
            <div className="grid grid-cols-2">
              <button
                onClick={() => setMode('create')}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'create'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Create Code
              </button>
              <button
                onClick={() => setMode('join')}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'join'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Join with Code
              </button>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Create Code Mode */}
          {mode === 'create' && (
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-100">
              <div className="text-center mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-fit mx-auto mb-4">
                  <Link className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Generate Partner Code</h2>
                <p className="text-sm text-gray-600">
                  Create a code to share with your partner so they can connect with you.
                </p>
              </div>

              {!generatedCode ? (
                <button
                  onClick={generateCode}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  {loading ? 'Generating...' : 'Generate Code & Link'}
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Code Section */}
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">Your partner code:</p>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-2xl font-bold text-gray-800 font-mono">
                        {generatedCode}
                      </span>
                      <button
                        onClick={copyCode}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Link Section */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Or share this link:</p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={generatedLink}
                        readOnly
                        className="flex-1 p-2 text-xs bg-white border border-blue-200 rounded text-gray-600"
                      />
                      <button
                        onClick={copyLink}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        {linkCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">Next Steps:</h3>
                    <ol className="text-sm text-green-700 space-y-1">
                      <li>1. Share the code or link with your partner</li>
                      <li>2. They can use either method to connect</li>
                      <li>3. Once connected, you can share moods together!</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Join with Code Mode */}
          {mode === 'join' && (
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-100">
              <div className="text-center mb-6">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-fit mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Join with Code</h2>
                <p className="text-sm text-gray-600">
                  Enter the code your partner shared with you to connect.
                </p>
              </div>

              <form onSubmit={joinWithCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner Code
                  </label>
                  <input
                    type="text"
                    value={partnerCode}
                    onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center text-lg font-mono"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || partnerCode.length !== 6}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  {loading ? 'Connecting...' : 'Connect with Partner'}
                </button>
              </form>
            </div>
          )}

          {/* Info Section */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200">
            <h3 className="font-semibold text-gray-800 mb-2">How it works:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• One person creates a code and shares it</li>
              <li>• The other person enters the code to connect</li>
              <li>• Once connected, you can share experiences together</li>
              <li>• Codes expire after 24 hours for security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
