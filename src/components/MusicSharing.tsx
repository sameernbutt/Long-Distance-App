import { useState, useEffect } from 'react';
import { Music, Plus, Heart, ExternalLink, X, Search, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addFeedItem, getFeedItems } from '../firebase/feed';
import { getPartnerId } from '../firebase/moods';

interface Song {
  id: string;
  title: string;
  artist: string;
  url?: string;
  addedBy: string;
  timestamp: number;
  note?: string;
  isFavorite: boolean;
}

interface Playlist {
  id: string;
  name: string;
  songs: string[];
  createdAt: number;
}

export default function MusicSharing() {
  const { user, userProfile } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isAddingSong, setIsAddingSong] = useState(false);
  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    url: '',
    addedBy: '',
    note: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'songs' | 'playlists'>('songs');
  const [loading, setLoading] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);

  // Load partner ID and feed items
  useEffect(() => {
    const loadData = async () => {
      if (user?.uid) {
        const partner = await getPartnerId(user.uid);
        setPartnerId(partner);
        
        if (partner) {
          // Load feed items (music) for both users
          const { items } = await getFeedItems(user.uid, partner);
          const musicItems = items.filter(item => item.type === 'music');
          
          // Convert feed items to songs format
          const feedSongs: Song[] = musicItems.map(item => ({
            id: item.id,
            title: item.caption.split(' - ')[0] || 'Unknown Title',
            artist: item.caption.split(' - ')[1] || 'Unknown Artist',
            url: item.content,
            addedBy: item.userName,
            timestamp: item.timestamp,
            note: item.caption.includes(' - ') ? item.caption.split(' - ').slice(2).join(' - ') : item.caption,
            isFavorite: false
          }));
          
          setSongs(feedSongs);
        }
      }
    };

    loadData();
  }, [user?.uid]);

  const addSong = async () => {
    if (!newSong.title.trim() || !newSong.artist.trim() || !user?.uid) return;

    setLoading(true);

    try {
      const caption = `${newSong.title.trim()} - ${newSong.artist.trim()}${newSong.note.trim() ? ` - ${newSong.note.trim()}` : ''}`;
      
      // Add to feed if user has a partner
      if (partnerId) {
        const result = await addFeedItem(
          user.uid,
          userProfile?.displayName || user.email || 'Unknown User',
          userProfile?.photoURL || null,
          'music',
          newSong.url.trim() || '',
          caption
        );
        
        if (result.error) {
          console.error('Failed to share music:', result.error);
          alert('Music failed to share with partner. Please try again.');
          return;
        } else {
          // Show success message
          alert('Music shared successfully with your partner! 💕');
        }
      }

      // Also add locally for immediate UI update
      const song: Song = {
        id: Date.now().toString(),
        title: newSong.title.trim(),
        artist: newSong.artist.trim(),
        url: newSong.url.trim() || undefined,
        addedBy: userProfile?.displayName || user.email || 'You',
        timestamp: Date.now(),
        note: newSong.note.trim() || undefined,
        isFavorite: false
      };

      setSongs(prev => [song, ...prev]);
      setNewSong({ title: '', artist: '', url: '', addedBy: '', note: '' });
      setIsAddingSong(false);
    } catch (error) {
      console.error('Error adding song:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id: string) => {
    setSongs(prev => prev.map(song => 
      song.id === id ? { ...song, isFavorite: !song.isFavorite } : song
    ));
  };

  const deleteSong = (id: string) => {
    setSongs(prev => prev.filter(song => song.id !== id));
  };

  const createPlaylist = () => {
    const playlistName = prompt('Enter playlist name:');
    if (!playlistName?.trim()) return;

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: playlistName.trim(),
      songs: [],
      createdAt: Date.now()
    };

    setPlaylists(prev => [newPlaylist, ...prev]);
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.addedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteSongs = songs.filter(song => song.isFavorite);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Only show if user has a partner
  if (!partnerId) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-8">
          <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Connect with Partner</h3>
          <p className="text-gray-600">Pair with your partner to start sharing music together</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Music Sharing</h2>
        <p className="text-gray-600 text-sm md:text-base">Share your favorite songs and create playlists together</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Partner Status */}
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 mb-6">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Music Sharing Status</div>
            <div className="text-lg font-semibold text-gray-800">
              {partnerId ? 'Connected with Partner' : 'Not Paired'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {partnerId 
                ? 'Share music with your partner in real-time!'
                : 'Pair with your partner to share music together'
              }
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('songs')}
            className={`px-6 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'songs'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Songs ({songs.length})
          </button>
          <button
            onClick={() => setActiveTab('playlists')}
            className={`px-6 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'playlists'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Playlists ({playlists.length})
          </button>
        </div>

        {activeTab === 'songs' && (
          <>
            {/* Add Song Button and Search */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <button
                onClick={() => setIsAddingSong(true)}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span>Add Song</span>
              </button>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search songs, artists, or who added it..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Favorites Section */}
            {favoriteSongs.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                  <Heart className="w-5 h-5 text-pink-500 fill-current" />
                  <h3 className="text-xl font-bold text-gray-800">Favorite Songs</h3>
                </div>
                <div className="grid gap-4">
                  {favoriteSongs.map(song => (
                    <div key={song.id} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{song.title}</h4>
                          <p className="text-gray-600">{song.artist}</p>
                          <p className="text-sm text-gray-500">Added by {song.addedBy}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {song.url && (
                            <a
                              href={song.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-white rounded-full hover:bg-gray-50 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 text-gray-600" />
                            </a>
                          )}
                          <Heart className="w-5 h-5 text-pink-500 fill-current" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Songs List */}
            {filteredSongs.length > 0 ? (
              <div className="space-y-4">
                {filteredSongs.map(song => (
                  <div key={song.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{song.title}</h3>
                        <p className="text-gray-600">{song.artist}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {song.url && (
                          <a
                            href={song.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                            title="Open link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        
                        <button
                          onClick={() => toggleFavorite(song.id)}
                          className={`p-2 rounded-full transition-colors ${
                            song.isFavorite
                              ? 'bg-pink-100 text-pink-500'
                              : 'bg-gray-100 text-gray-400 hover:bg-pink-100 hover:text-pink-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${song.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        
                        <button
                          onClick={() => deleteSong(song.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Added by {song.addedBy}</span>
                      <span>{formatDate(song.timestamp)}</span>
                    </div>
                    
                    {song.note && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 italic">"{song.note}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  {searchQuery ? 'No songs match your search' : 'No songs shared yet'}
                </p>
                {!searchQuery && (
                  <p className="text-sm text-gray-400">Add your first song to start building your shared music library</p>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'playlists' && (
          <div>
            <button
              onClick={createPlaylist}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 mb-6"
            >
              <Plus className="w-5 h-5" />
              <span>Create Playlist</span>
            </button>

            {playlists.length > 0 ? (
              <div className="grid gap-4">
                {playlists.map(playlist => (
                  <div key={playlist.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{playlist.name}</h3>
                    <p className="text-sm text-gray-500">{playlist.songs.length} songs • Created {formatDate(playlist.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No playlists created yet</p>
                <p className="text-sm text-gray-400">Create your first playlist to organize your shared music</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Song Modal */}
      {isAddingSong && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Add New Song</h3>
              <button
                onClick={() => setIsAddingSong(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Song Title *</label>
                <input
                  type="text"
                  value={newSong.title}
                  onChange={(e) => setNewSong(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter song title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Artist *</label>
                <input
                  type="text"
                  value={newSong.artist}
                  onChange={(e) => setNewSong(prev => ({ ...prev, artist: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter artist name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link (optional)</label>
                <input
                  type="url"
                  value={newSong.url}
                  onChange={(e) => setNewSong(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Spotify, YouTube, Apple Music, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Added by (optional)</label>
                <input
                  type="text"
                  value={newSong.addedBy}
                  onChange={(e) => setNewSong(prev => ({ ...prev, addedBy: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder={userProfile?.displayName || user?.email || 'You'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note (optional)</label>
                <textarea
                  value={newSong.note}
                  onChange={(e) => setNewSong(prev => ({ ...prev, note: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Why you love this song, what it reminds you of, etc."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={addSong}
                disabled={!newSong.title.trim() || !newSong.artist.trim() || loading}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sharing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Share2 className="w-4 h-4" />
                    <span>Share Song</span>
                  </div>
                )}
              </button>
              <button
                onClick={() => setIsAddingSong(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}