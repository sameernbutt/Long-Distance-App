import { useState } from 'react';
import { ArrowLeft, MessageSquare, Star, Send, CheckCircle } from 'lucide-react';

interface FeedbackProps {
  onBack: () => void;
  isDarkMode?: boolean;
}

export default function Feedback({ onBack, isDarkMode = false }: FeedbackProps) {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('general');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    { value: 'general', label: 'General Feedback' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'ui', label: 'UI/UX Issue' },
    { value: 'performance', label: 'Performance Issue' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim() && rating > 0) {
      // Here you would typically send the feedback to your backend
      console.log('Feedback submitted:', { feedback, rating, category });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFeedback('');
        setRating(0);
        setCategory('general');
      }, 3000);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${
        isDarkMode 
          ? 'bg-gray-900' 
          : 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50'
      }`}>
        <div className={`rounded-xl p-8 shadow-lg border-2 text-center max-w-md mx-4 transition-colors ${
          isDarkMode 
            ? 'bg-black border-purple-900' 
            : 'bg-white border-gray-100'
        }`}>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-2 transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>Thank You!</h2>
          <p className={`transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Your feedback has been submitted successfully.</p>
        </div>
      </div>
    );
  }

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
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-bold transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Feedback</h1>
              <p className={`text-xs transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Share your thoughts with us</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Section */}
            <div className={`rounded-xl p-4 md:p-6 shadow-lg border-2 transition-colors ${
              isDarkMode 
                ? 'bg-black border-purple-900' 
                : 'bg-white border-gray-100'
            }`}>
              <h2 className={`text-lg font-bold mb-4 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>How would you rate the app?</h2>
              <div className="flex space-x-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-xl transition-colors ${
                      star <= rating
                        ? 'text-yellow-500 bg-yellow-500/20'
                        : isDarkMode 
                          ? 'text-gray-600 hover:text-yellow-400' 
                          : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    <Star className={`w-6 h-6 ${star <= rating ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className={`text-center text-sm mt-2 transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Category Selection */}
            <div className={`rounded-xl p-4 md:p-6 shadow-lg border-2 transition-colors ${
              isDarkMode 
                ? 'bg-black border-purple-900' 
                : 'bg-white border-gray-100'
            }`}>
              <h2 className={`text-lg font-bold mb-4 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>What type of feedback is this?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`p-3 rounded-xl border-2 transition-colors text-left ${
                      category === cat.value
                        ? 'border-pink-500 bg-pink-500/20 text-pink-500'
                        : isDarkMode 
                          ? 'border-purple-900 text-gray-300 hover:border-purple-800' 
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Text */}
            <div className={`rounded-xl p-4 md:p-6 shadow-lg border-2 transition-colors ${
              isDarkMode 
                ? 'bg-black border-purple-900' 
                : 'bg-white border-gray-100'
            }`}>
              <h2 className={`text-lg font-bold mb-4 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Tell us more</h2>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts, suggestions, or report any issues you've encountered..."
                className={`w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none transition-colors ${
                  isDarkMode 
                    ? 'bg-black border-purple-900 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
                rows={6}
                required
              />
              <p className={`text-xs mt-2 transition-colors ${
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {feedback.length}/1000 characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!feedback.trim() || rating === 0}
              className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              <Send className="w-5 h-5" />
              <span>Submit Feedback</span>
            </button>
          </form>

          {/* Additional Info */}
          <div className={`mt-6 rounded-xl p-4 border-2 transition-colors ${
            isDarkMode 
              ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-purple-900' 
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
          }`}>
            <h3 className={`font-semibold mb-2 transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>Privacy Note</h3>
            <p className={`text-sm transition-colors ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Your feedback is anonymous and will be used to improve the app. 
              We may contact you if you provide an email address for follow-up questions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
