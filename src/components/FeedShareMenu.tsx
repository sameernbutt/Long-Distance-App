import React, { useState } from 'react';
import { Plus, Image, Video, Music } from 'lucide-react';

interface Props {
  onSharePhoto: () => void;
  onShareVideo: () => void;
  onShareMusic: () => void;
  isDarkMode?: boolean;
}

const FeedShareMenu: React.FC<Props> = ({ onSharePhoto, onShareVideo, onShareMusic, isDarkMode = false }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        className="p-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
        onClick={() => setOpen((v) => !v)}
        aria-label="Share something"
      >
        <Plus className="w-6 h-6" />
      </button>
      {open && (
        <div className={`absolute right-0 mt-2 w-44 rounded-xl shadow-lg z-10 border transition-colors ${
          isDarkMode 
            ? 'bg-gray-900 border-gray-600' 
            : 'bg-white border-pink-100'
        }`}>
          <button
            className={`flex items-center w-full px-4 py-2 rounded-t-xl transition-colors ${
              isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-pink-50'
            }`}
            onClick={() => { setOpen(false); onSharePhoto(); }}
          >
            <Image className="w-5 h-5 mr-2 text-pink-500" /> Share Photo
          </button>
          <button
            className={`flex items-center w-full px-4 py-2 transition-colors ${
              isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-pink-50'
            }`}
            onClick={() => { setOpen(false); onShareVideo(); }}
          >
            <Video className="w-5 h-5 mr-2 text-purple-500" /> Share Video
          </button>
          <button
            className={`flex items-center w-full px-4 py-2 rounded-b-xl transition-colors ${
              isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-pink-50'
            }`}
            onClick={() => { setOpen(false); onShareMusic(); }}
          >
            <Music className="w-5 h-5 mr-2 text-blue-500" /> Share Music
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedShareMenu;
