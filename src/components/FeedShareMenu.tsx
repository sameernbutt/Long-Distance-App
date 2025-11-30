import React, { useState, useEffect, useRef } from 'react';
import { Plus, Camera, Music } from 'lucide-react';

interface Props {
  onSharePhotoVideo: () => void;
  onShareMusic: () => void;
  isDarkMode?: boolean;
}

const FeedShareMenu: React.FC<Props> = ({ onSharePhotoVideo, onShareMusic, isDarkMode = false }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(!open);
  };

  // Close on click/touch outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        className={`p-3 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 active:from-pink-700 active:to-pink-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-pink-300 ${
          open ? 'rotate-45' : 'rotate-0'
        }`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        onClick={handleToggle}
        aria-label="Share something"
      >
        <Plus className="w-5 h-5 transition-transform duration-200" />
      </button>
      {open && (
        <div className={`absolute right-0 bottom-full mb-2 w-48 rounded-xl shadow-lg z-10 border overflow-hidden transition-transform duration-150 transform origin-bottom-right ${
          isDarkMode 
            ? 'bg-gray-900 border-pink-900/50' 
            : 'bg-white border-gray-200'
        }`}>
          <button
            className={`flex items-center w-full px-4 py-3 transition-colors duration-100 active:scale-[0.98] focus:outline-none ${
              isDarkMode 
                ? 'text-gray-200 hover:bg-pink-900/20 active:bg-pink-900/30' 
                : 'text-gray-700 hover:bg-pink-50 active:bg-pink-100'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            onClick={() => { handleClose(); onSharePhotoVideo(); }}
          >
            <Camera className={`w-4 h-4 mr-3 ${isDarkMode ? 'text-pink-400' : 'text-pink-500'}`} />
            <span className="text-sm font-medium">Photo/Video</span>
          </button>
          <div className={`h-px ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
          <button
            className={`flex items-center w-full px-4 py-3 transition-colors duration-100 active:scale-[0.98] focus:outline-none ${
              isDarkMode 
                ? 'text-gray-200 hover:bg-blue-900/20 active:bg-blue-900/30' 
                : 'text-gray-700 hover:bg-blue-50 active:bg-blue-100'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            onClick={() => { handleClose(); onShareMusic(); }}
          >
            <Music className={`w-4 h-4 mr-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            <span className="text-sm font-medium">Share Music</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedShareMenu;
