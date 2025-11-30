import React, { useEffect, useState } from 'react';
import { getFeedItems, addComment, toggleReaction, FeedItem } from '../firebase/feed';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Smile, MessageCircle } from 'lucide-react';

const EMOJIS = ['❤️', '😂', '😍', '😮', '😢', '👍', '🔥', '🎉'];

interface FeedListProps {
  partnerId: string;
  isDarkMode?: boolean;
}

const FeedList: React.FC<FeedListProps> = ({ partnerId, isDarkMode = false }) => {
  const { user, userProfile } = useAuth();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [commentText, setCommentText] = useState<{ [id: string]: string }>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFeed = async () => {
    if (!user) return;
    setLoading(true);
    const { items } = await getFeedItems(user.uid, partnerId);
    setFeed(items);
    setLoading(false);
  };

  useEffect(() => {
    if (!user || !partnerId) return;
    const feedRef = collection(db, 'feed');
    const q = query(
      feedRef,
      where('userId', 'in', [user.uid, partnerId]),
      orderBy('timestamp', 'desc')
    );
    const unsub = onSnapshot(q, (querySnapshot) => {
      const items: FeedItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as FeedItem);
      });
      setFeed(items);
      setLoading(false);
    });
    setLoading(true);
    return () => unsub();
  }, [user, partnerId]);

  const handleComment = async (itemId: string) => {
    if (!user || !userProfile) return;
    const text = commentText[itemId]?.trim();
    if (!text) return;
    await addComment(itemId, user.uid, userProfile.displayName || 'User', text);
    setCommentText((prev) => ({ ...prev, [itemId]: '' }));
    fetchFeed();
  };

  const handleReaction = async (itemId: string, emoji: string) => {
    if (!user) return;
    await toggleReaction(itemId, user.uid, emoji);
    fetchFeed();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mb-3"></div>
      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading feed...</p>
    </div>
  );

  if (!feed.length) return <div className={`text-center transition-colors ${
    isDarkMode ? 'text-gray-400' : 'text-gray-400'
  }`}>No posts yet. Start sharing!</div>;

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {feed.map((item) => (
        <div key={item.id} className={`rounded-2xl shadow-lg p-5 transition-all duration-200 ${
          isDarkMode 
            ? 'bg-black border border-pink-900/60' 
            : 'bg-white border border-gray-100 shadow-gray-200/50'
        }`}>
          {/* Content */}
          <div className="mb-3">
            {item.type === 'photo' && (
              <img src={item.content} alt="Shared" className="rounded-xl max-h-96 w-full object-cover mb-3 shadow-md" />
            )}
            {item.type === 'video' && (
              <video src={item.content} controls className="rounded-xl max-h-96 w-full object-cover mb-3 shadow-md" />
            )}
            {item.type === 'music' && (
              <a 
                href={item.content} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode 
                    ? 'text-blue-400 bg-blue-900/20 hover:bg-blue-900/30' 
                    : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                }`}
              >
                🎵 Listen to music
              </a>
            )}
            <div className={`text-sm font-bold transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>{item.userName}</div>
            <div className={`text-xs mb-2 transition-colors ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>{new Date(item.timestamp).toLocaleString()}</div>
            {item.caption && (
              <div className={`text-base mb-1 transition-colors ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>{item.caption}</div>
            )}
          </div>
          {/* Reactions */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {item.reactions && Object.entries(item.reactions).map(([emoji, users]) => (
              <button
                key={emoji}
                className={`px-3 py-1.5 rounded-full text-base border transition-all duration-150 active:scale-95 focus:outline-none ${
                  users.includes(user?.uid) 
                    ? isDarkMode
                      ? 'bg-pink-900/30 border-pink-500/50 ring-1 ring-pink-500/30'
                      : 'bg-pink-100 border-pink-400 ring-1 ring-pink-300' 
                    : isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
                onClick={() => handleReaction(item.id, emoji)}
              >
                {emoji} <span className="text-xs font-medium ml-1">{users.length}</span>
              </button>
            ))}
            <div className="relative">
              <button
                className={`p-2 rounded-full transition-all duration-150 active:scale-95 focus:outline-none ${
                  isDarkMode 
                    ? 'hover:bg-gray-800 active:bg-gray-700' 
                    : 'hover:bg-pink-50 active:bg-pink-100'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
                onClick={() => setShowEmojiPicker(item.id === showEmojiPicker ? null : item.id)}
                aria-label="Add reaction"
              >
                <Smile className={`w-5 h-5 ${isDarkMode ? 'text-pink-400' : 'text-pink-500'}`} />
              </button>
              {showEmojiPicker === item.id && (
                <div className={`absolute z-10 border rounded-xl shadow-xl p-2 flex gap-1 mt-2 transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      className={`text-2xl p-2 rounded-lg transition-all duration-150 active:scale-90 focus:outline-none ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-pink-50'
                      }`}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                      onClick={() => { handleReaction(item.id, emoji); setShowEmojiPicker(null); }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Comments */}
          <div className="mb-3">
            <div className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Comments:</div>
            {item.comments && item.comments.length > 0 ? (
              <div className="space-y-2">
                {item.comments.map((c) => (
                  <div key={c.id} className={`flex items-start gap-2 text-sm p-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                  }`}>
                    <MessageCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      isDarkMode ? 'text-pink-400' : 'text-pink-500'
                    }`} />
                    <div className="flex-1">
                      <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{c.userName}:</span> 
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}> {c.content}</span>
                      <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(c.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No comments yet.</div>
            )}
          </div>
          {/* Add comment */}
          <div className="flex items-center gap-2 mt-3">
            <input
              type="text"
              className={`flex-1 min-w-0 border-2 rounded-xl px-3 py-2 text-sm transition-all duration-150 focus:outline-none focus:ring-2 ${
                isDarkMode 
                  ? 'bg-black border-purple-900 text-white placeholder-gray-500 focus:ring-pink-500/50 focus:border-pink-500' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-pink-300 focus:border-pink-300'
              }`}
              placeholder="Add a comment..."
              value={commentText[item.id] || ''}
              onChange={e => setCommentText(prev => ({ ...prev, [item.id]: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') handleComment(item.id); }}
            />
            <button
              className={`flex-shrink-0 px-3 py-2 rounded-xl font-medium text-sm transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 ${
                isDarkMode 
                  ? 'bg-pink-600 text-white hover:bg-pink-500 active:bg-pink-700 focus:ring-pink-500/50' 
                  : 'bg-pink-500 text-white hover:bg-pink-600 active:bg-pink-700 focus:ring-pink-300'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              onClick={() => handleComment(item.id)}
            >
              Post
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeedList;
