import React, { useState } from 'react';
import { Plus, Camera, Music } from 'lucide-react';

interface Props {
  onSharePhotoVideo: () => void;
  onShareMusic: () => void;
  isDarkMode?: boolean;
}

const FeedShareMenu: React.FC<Props> = ({ onSharePhotoVideo, onShareMusic, isDarkMode = false }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        className="p-4 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 active:from-pink-700 active:to-pink-800 text-white shadow-xl hover:shadow-2xl transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-pink-300 active:scale-95"
        style={{ WebkitTapHighlightColor: 'transparent' }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Share something"
      >
        <Plus className="w-6 h-6" />
      </button>
      {open && (
        <div className={`absolute right-0 bottom-full mb-2 w-52 rounded-2xl shadow-2xl z-10 border overflow-hidden transition-colors ${
          isDarkMode 
            ? 'bg-gray-900 border-pink-900/50 shadow-pink-900/20' 
            : 'bg-white border-gray-200'
        }`}>
          <button
            className={`flex items-center w-full px-5 py-3.5 transition-all duration-150 active:scale-[0.98] focus:outline-none ${
              isDarkMode 
                ? 'text-gray-200 hover:bg-pink-900/20 active:bg-pink-900/30' 
                : 'text-gray-700 hover:bg-pink-50 active:bg-pink-100'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            onClick={() => { setOpen(false); onSharePhotoVideo(); }}
          >
            <Camera className={`w-5 h-5 mr-3 ${isDarkMode ? 'text-pink-400' : 'text-pink-500'}`} /> 
            <span className="font-medium">Photo/Video</span>
          </button>
          <button
            className={`flex items-center w-full px-5 py-3.5 transition-all duration-150 active:scale-[0.98] focus:outline-none ${
              isDarkMode 
                ? 'text-gray-200 hover:bg-blue-900/20 active:bg-blue-900/30' 
                : 'text-gray-700 hover:bg-blue-50 active:bg-blue-100'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            onClick={() => { setOpen(false); onShareMusic(); }}
          >
            <Music className={`w-5 h-5 mr-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} /> 
            <span className="font-medium">Share Music</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedShareMenu;
