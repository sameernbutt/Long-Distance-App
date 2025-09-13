import { ArrowLeft, HelpCircle, MessageCircle, Mail, Phone } from 'lucide-react';

interface HelpProps {
  onBack: () => void;
}

export default function Help({ onBack }: HelpProps) {
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
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Help & Support</h1>
              <p className="text-xs text-gray-600">Get help with the app</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* FAQ Section */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-semibold text-gray-800 mb-2">How do I pair with my partner?</h3>
                <p className="text-sm text-gray-600">
                  Go to the Profile tab and click "Pair with Partner". One person generates a code, 
                  and the other person enters it to connect.
                </p>
              </div>
              
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-semibold text-gray-800 mb-2">How do I share photos and videos?</h3>
                <p className="text-sm text-gray-600">
                  Go to the Feed tab and tap the camera icon. Select a photo or video (max 10MB) 
                  and add a caption to share with your partner.
                </p>
              </div>
              
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-semibold text-gray-800 mb-2">How do I add music to the feed?</h3>
                <p className="text-sm text-gray-600">
                  In the Feed tab, tap the music icon and paste a link from Spotify, YouTube, 
                  Apple Music, or any music streaming service.
                </p>
              </div>
              
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Can I edit or delete my shared content?</h3>
                <p className="text-sm text-gray-600">
                  Yes! Tap the three dots menu on any of your shared items to edit or delete them.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">How do I create custom date ideas?</h3>
                <p className="text-sm text-gray-600">
                  Go to the Dates tab and scroll down to the "Date Bucket List" section. 
                  Add your own custom date ideas that both partners can see and like.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Support</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-800">Email Support</p>
                  <p className="text-sm text-gray-600">support@togetherapart.app</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <MessageCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-800">Live Chat</p>
                  <p className="text-sm text-gray-600">Available 24/7</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-gray-800">Phone Support</p>
                  <p className="text-sm text-gray-600">1-800-TOGETHER</p>
                </div>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 md:p-6 border border-pink-200">
            <h2 className="text-lg font-bold text-gray-800 mb-3">App Information</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Version:</span> 1.0.0</p>
              <p><span className="font-medium">Last Updated:</span> {new Date().toLocaleDateString()}</p>
              <p><span className="font-medium">Platform:</span> Web App (PWA)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
