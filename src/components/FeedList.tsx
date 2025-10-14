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

  if (loading) return <div className={`text-center transition-colors ${
    isDarkMode ? 'text-gray-400' : 'text-gray-400'
  }`}>Loading feed...</div>;

  if (!feed.length) return <div className={`text-center transition-colors ${
    isDarkMode ? 'text-gray-400' : 'text-gray-400'
  }`}>No posts yet. Start sharing!</div>;

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {feed.map((item) => (
        <div key={item.id} className={`rounded-xl shadow p-4 transition-colors ${
          isDarkMode 
            ? 'bg-black border border-pink-900' 
            : 'bg-white'
        }`}>
          {/* Content */}
          <div className="mb-2">
            {item.type === 'photo' && (
              <img src={item.content} alt="Shared" className="rounded-lg max-h-64 w-full object-cover mb-2" />
            )}
            {item.type === 'video' && (
              <video src={item.content} controls className="rounded-lg max-h-64 w-full object-cover mb-2" />
            )}
            {item.type === 'music' && (
              <a href={item.content} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">🎵 Listen to music</a>
            )}
            <div className={`text-sm font-semibold transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-700'
            }`}>{item.userName}</div>
            <div className={`text-xs mb-1 transition-colors ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>{new Date(item.timestamp).toLocaleString()}</div>
            <div className={`text-base mb-1 transition-colors ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>{item.caption}</div>
          </div>
          {/* Reactions */}
          <div className="flex items-center gap-2 mb-2">
            {item.reactions && Object.entries(item.reactions).map(([emoji, users]) => (
              <button
                key={emoji}
                className={`px-2 py-1 rounded-full text-lg border transition-colors ${
                  users.includes(user?.uid) 
                    ? 'bg-pink-100 border-pink-400' 
                    : isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-200'
                }`}
                onClick={() => handleReaction(item.id, emoji)}
              >
                {emoji} <span className="text-xs">{users.length}</span>
              </button>
            ))}
            <div className="relative">
              <button
                className={`p-1 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-pink-50'
                }`}
                onClick={() => setShowEmojiPicker(item.id === showEmojiPicker ? null : item.id)}
                aria-label="Add reaction"
              >
                <Smile className="w-5 h-5 text-pink-400" />
              </button>
              {showEmojiPicker === item.id && (
                <div className={`absolute z-10 border rounded shadow p-2 flex gap-1 mt-1 transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-200'
                }`}>
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      className={`text-xl rounded transition-colors ${
                        isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-pink-100'
                      }`}
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
          <div className="mb-2">
            <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Comments:</div>
            {item.comments && item.comments.length > 0 ? (
              <div className="space-y-1">
                {item.comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2 text-sm">
                    <MessageCircle className="w-4 h-4 text-pink-300 mt-0.5" />
                    <div>
                      <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{c.userName}:</span> 
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}> {c.content}</span>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                        {new Date(c.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>No comments yet.</div>
            )}
          </div>
          {/* Add comment */}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              className={`flex-1 border rounded px-2 py-1 text-sm transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'border-gray-200 focus:border-pink-300'
              }`}
              placeholder="Add a comment..."
              value={commentText[item.id] || ''}
              onChange={e => setCommentText(prev => ({ ...prev, [item.id]: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') handleComment(item.id); }}
            />
            <button
              className={`px-3 py-1 rounded hover:transition-colors text-sm ${
                isDarkMode 
                  ? 'bg-pink-600 text-white hover:bg-pink-500' 
                  : 'bg-pink-500 text-white hover:bg-pink-600'
              }`}
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
