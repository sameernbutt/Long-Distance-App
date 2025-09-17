import React, { useState, useEffect } from 'react';
import { Video, Upload, Heart, X, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addFeedItem, getFeedItems, uploadFile } from '../firebase/feed';
import { getPartnerId } from '../firebase/moods';

interface VideoItem {
  id: string;
  url: string;
  caption: string;
  timestamp: number;
  isFavorite: boolean;
  thumbnail?: string;
}

export default function VideoSharing() {
  const { user, userProfile } = useAuth();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [partnerId, setPartnerId] = useState<string | null>(null);

  // Load partner ID and feed items
  useEffect(() => {
    const loadData = async () => {
      if (user?.uid) {
        const partner = await getPartnerId(user.uid);
        setPartnerId(partner);
        
        if (partner) {
          // Load feed items (videos) for both users
          const { items } = await getFeedItems(user.uid, partner);
          const videoItems = items.filter(item => item.type === 'video');
          
          // Convert feed items to videos format
          const feedVideos: VideoItem[] = videoItems.map(item => ({
            id: item.id,
            url: item.content,
            caption: item.caption,
            timestamp: item.timestamp,
            isFavorite: false,
            thumbnail: item.content // For now, use the video URL as thumbnail
          }));
          
          setVideos(feedVideos);
        }
      }
    };

    loadData();
  }, [user?.uid]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.uid) return;

    if (file.size > 50 * 1024 * 1024) { // 50MB limit for videos
      alert('File size too large. Please choose a file under 50MB.');
      return;
    }

    setIsUploading(true);

    try {
      let videoUrl: string | undefined = undefined;
      // Upload to Firebase Storage if user has a partner
      if (partnerId) {
        videoUrl = await uploadFile(file, user.uid);
        // Add to feed
        const result = await addFeedItem(
          user.uid,
          userProfile?.displayName || user.email || 'Unknown User',
          userProfile?.photoURL,
          'video',
          videoUrl,
          caption.trim() || 'Shared with love 💕'
        );
        if (result.error) {
          console.error('Failed to share video:', result.error);
        }
      } else {
        // Use local URL for immediate preview
        videoUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      }
      if (!videoUrl) throw new Error('No video URL');
      // Add to local state for immediate UI update
      const newVideo: VideoItem = {
        id: Date.now().toString(),
        url: videoUrl,
        caption: caption.trim() || 'Shared with love 💕',
        timestamp: Date.now(),
        isFavorite: false,
        thumbnail: videoUrl // For now, use the video URL as thumbnail
      };
      setVideos(prev => [newVideo, ...prev]);
      setCaption('');
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleFavorite = (id: string) => {
    setVideos(prev => prev.map(video => 
      video.id === id ? { ...video, isFavorite: !video.isFavorite } : video
    ));
  };

  const deleteVideo = (id: string) => {
    setVideos(prev => prev.filter(video => video.id !== id));
    setSelectedVideo(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const favoriteVideos = videos.filter(video => video.isFavorite);

  return (
    <div className="p-4 md:p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Video Sharing</h2>
        <p className="text-gray-600 text-sm md:text-base">Share your favorite videos and memories together</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Partner Status */}
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 mb-6">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Video Sharing Status</div>
            <div className="text-lg font-semibold text-gray-800">
              {partnerId ? 'Connected with Partner' : 'Not Paired'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {partnerId 
                ? 'Share videos with your partner in real-time!'
                : 'Pair with your partner to share videos together'
              }
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="text-center">
            <div className="p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full w-fit mx-auto mb-4">
              <Video className="w-8 h-8 text-pink-600" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-2">Share a Video</h3>
            <p className="text-gray-600 mb-4">Upload a special moment to share with your partner</p>
            
            <div className="mb-4">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption (optional)"
                className="w-full max-w-md p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <label 
                htmlFor="video-upload"
                className={`inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 cursor-pointer transition-all duration-200 ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Choose Video</span>
                  </>
                )}
              </label>
              <label
                htmlFor="video-capture"
                className={`inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl hover:from-pink-500 hover:to-purple-500 cursor-pointer transition-all duration-200 ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Video className="w-5 h-5" />
                <span>Record Video</span>
              </label>
            </div>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
            <input
              id="video-capture"
              type="file"
              accept="video/*"
              capture="environment"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </div>
        </div>

        {/* Favorites Section */}
        {favoriteVideos.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="w-5 h-5 text-pink-500 fill-current" />
              <h3 className="text-xl font-bold text-gray-800">Favorites</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {favoriteVideos.map(video => (
                <div key={video.id} className="relative group cursor-pointer" onClick={() => setSelectedVideo(video)}>
                  <div className="relative">
                    <video
                      src={video.url}
                      className="w-full h-48 object-cover rounded-xl shadow-lg"
                      poster={video.thumbnail}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all duration-200 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Heart className="w-4 h-4 text-pink-500 fill-current" />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 truncate">{video.caption}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Grid */}
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {videos.map(video => (
              <div key={video.id} className="relative group cursor-pointer" onClick={() => setSelectedVideo(video)}>
                <div className="relative">
                  <video
                    src={video.url}
                    className="w-full h-48 object-cover rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200"
                    poster={video.thumbnail}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all duration-200 flex items-center justify-center">
                    <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(video.id);
                    }}
                    className="absolute top-2 right-2 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <Heart className={`w-4 h-4 ${video.isFavorite ? 'text-pink-500 fill-current' : 'text-gray-600'}`} />
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-600 truncate">{video.caption}</p>
                <p className="text-xs text-gray-500">{formatDate(video.timestamp)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No videos shared yet</p>
            <p className="text-sm text-gray-400">Upload your first video to start building your shared collection</p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="relative">
              <video
                src={selectedVideo.url}
                controls
                className="w-full max-h-96"
                autoPlay
              />
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-lg font-medium text-gray-800 mb-2">{selectedVideo.caption}</p>
              <p className="text-sm text-gray-600 mb-4">{formatDate(selectedVideo.timestamp)}</p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => toggleFavorite(selectedVideo.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                    selectedVideo.isFavorite
                      ? 'bg-pink-100 text-pink-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${selectedVideo.isFavorite ? 'fill-current' : ''}`} />
                  <span>{selectedVideo.isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
                </button>
                
                <button
                  onClick={() => deleteVideo(selectedVideo.id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
