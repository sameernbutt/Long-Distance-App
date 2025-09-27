import React, { useState, useEffect } from 'react';
import { Camera, Upload, Heart, X, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addFeedItem, getFeedItems, uploadFile } from '../firebase/feed';
import { getPartnerId } from '../firebase/moods';

interface Photo {
  id: string;
  url: string;
  caption: string;
  timestamp: number;
  isFavorite: boolean;
}

export default function PhotoGallery() {
  const { user, userProfile } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
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
          // Load feed items (photos) for both users
          const { items } = await getFeedItems(user.uid, partner);
          const photoItems = items.filter(item => item.type === 'photo');
          
          // Convert feed items to photos format
          const feedPhotos: Photo[] = photoItems.map(item => ({
            id: item.id,
            url: item.content,
            caption: item.caption,
            timestamp: item.timestamp,
            isFavorite: false
          }));
          
          setPhotos(feedPhotos);
        }
      }
    };

    loadData();
  }, [user?.uid]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    // Always reset the input to allow selecting the same file again
    event.target.value = '';
    
    if (!file || !user?.uid) return;

    // Add mobile debugging
    const isMobile = navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('Mobile');
    console.log('Upload starting - Mobile device:', isMobile);
    console.log('User agent:', navigator.userAgent);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File size too large. Please choose a file under 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      let photoUrl: string | undefined = undefined;
      // Upload to Firebase Storage if user has a partner
      if (partnerId) {
        // Add timeout to prevent hanging uploads
        const uploadPromise = uploadFile(file, user.uid);
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout')), 30000)
        );
        
        try {
          photoUrl = await Promise.race([uploadPromise, timeoutPromise]);
        } catch (uploadError) {
          if (uploadError instanceof Error && uploadError.message === 'Upload timeout') {
            alert('Upload is taking too long. Please check your connection and try again.');
          } else {
            alert('Failed to upload photo to storage. Please try again.');
          }
          return;
        }
        
        // Add to feed with mobile-specific handling
        const isMobile = navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('Mobile');
        
        try {
          const result = await addFeedItem(
            user.uid,
            userProfile?.displayName || user.email || 'Unknown User',
            userProfile?.photoURL,
            'photo',
            photoUrl,
            caption.trim() || 'Shared with love 💕'
          );
          
          console.log('Feed item result:', result);
          
          if (result.error) {
            console.error('Failed to share photo:', result.error);
            
             if (isMobile) {
               console.log('Mobile device - implementing retry mechanism...');
               // On mobile, try again after a short delay
               setTimeout(async () => {
                 if (!photoUrl) return;
                 try {
                   const retryResult = await addFeedItem(
                     user.uid,
                     userProfile?.displayName || user.email || 'Unknown User',
                     userProfile?.photoURL,
                     'photo',
                     photoUrl,
                     caption.trim() || 'Shared with love 💕'
                   );
                  
                  if (retryResult.error) {
                    console.error('Retry also failed:', retryResult.error);
                    alert('Photo uploaded but failed to share with partner. Please try again.');
                  } else {
                    console.log('Retry successful!');
                    alert('Photo shared successfully with your partner! 💕');
                  }
                } catch (retryError) {
                  console.error('Retry error:', retryError);
                  alert('Photo uploaded but failed to share with partner. Please try again.');
                }
              }, 1000); // Wait 1 second then retry
            } else {
              alert('Photo uploaded but failed to share with partner. Please try again.');
            }
            return;
          } else {
            // Show success message
            alert('Photo shared successfully with your partner! 💕');
          }
        } catch (feedError) {
          console.error('Error adding to feed:', feedError);
          
           if (isMobile) {
             console.log('Mobile device - implementing retry mechanism for exception...');
             // On mobile, try again after a short delay
             setTimeout(async () => {
               if (!photoUrl) return;
               try {
                 const retryResult = await addFeedItem(
                   user.uid,
                   userProfile?.displayName || user.email || 'Unknown User',
                   userProfile?.photoURL,
                   'photo',
                   photoUrl,
                   caption.trim() || 'Shared with love 💕'
                 );
                
                if (retryResult.error) {
                  console.error('Retry also failed:', retryResult.error);
                  alert('Photo uploaded but failed to share with partner. Please try again.');
                } else {
                  console.log('Retry successful!');
                  alert('Photo shared successfully with your partner! 💕');
                }
              } catch (retryError) {
                console.error('Retry error:', retryError);
                alert('Photo uploaded but failed to share with partner. Please try again.');
              }
            }, 1000);
          } else {
            alert('Photo uploaded but failed to share with partner. Please try again.');
          }
          return;
        }
      } else {
        // Use local URL for immediate preview
        photoUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      }
      if (!photoUrl) throw new Error('No photo URL');
      // Add to local state for immediate UI update
      const newPhoto: Photo = {
        id: Date.now().toString(),
        url: photoUrl,
        caption: caption.trim() || 'Shared with love 💕',
        timestamp: Date.now(),
        isFavorite: false
      };
      setPhotos(prev => [newPhoto, ...prev]);
      setCaption('');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Separate handler for camera capture to handle cancellation better
  const handleCameraCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Immediately reset input to prevent UI freeze
    const file = event.target.files?.[0];
    event.target.value = '';
    
    if (!file) {
      // User cancelled, just return without any action
      return;
    }
    
    // Use the same upload logic
    await handleFileUpload({ target: { files: [file], value: '' } } as any);
  };

  const toggleFavorite = (id: string) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === id ? { ...photo, isFavorite: !photo.isFavorite } : photo
    ));
  };

  const deletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
    setSelectedPhoto(null);
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

  const downloadPhoto = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `shared-photo-${photo.id}.jpg`;
    link.click();
  };

  const favoritePhotos = photos.filter(photo => photo.isFavorite);

  // Only show if user has a partner
  if (!partnerId) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-8">
          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Connect with Partner</h3>
          <p className="text-gray-600">Pair with your partner to start sharing photos together</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Photo Gallery</h2>
        <p className="text-gray-600 text-sm md:text-base">Share your favorite moments together</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Partner Status */}
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 mb-6">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Photo Sharing Status</div>
            <div className="text-lg font-semibold text-gray-800">
              {partnerId ? 'Connected with Partner' : 'Not Paired'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {partnerId 
                ? 'Share photos with your partner in real-time!'
                : 'Pair with your partner to share photos together'
              }
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="text-center">
            <div className="p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full w-fit mx-auto mb-4">
              <Camera className="w-8 h-8 text-pink-600" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-2">Share a Photo</h3>
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
                htmlFor="photo-upload"
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
                    <span>Choose Photo</span>
                  </>
                )}
              </label>
              <label
                htmlFor="photo-capture"
                className={`inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl hover:from-pink-500 hover:to-purple-500 cursor-pointer transition-all duration-200 ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Camera className="w-5 h-5" />
                <span>Take Photo</span>
              </label>
            </div>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
            <input
              id="photo-capture"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              disabled={isUploading}
              className="hidden"
            />
          </div>
        </div>

        {/* Favorites Section */}
        {favoritePhotos.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="w-5 h-5 text-pink-500 fill-current" />
              <h3 className="text-xl font-bold text-gray-800">Favorites</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {favoritePhotos.map(photo => (
                <div key={photo.id} className="relative group cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-32 object-cover rounded-xl shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all duration-200" />
                  <div className="absolute top-2 right-2">
                    <Heart className="w-4 h-4 text-pink-500 fill-current" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photo Grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="relative group cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-32 object-cover rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all duration-200" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(photo.id);
                  }}
                  className="absolute top-2 right-2 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Heart className={`w-4 h-4 ${photo.isFavorite ? 'text-pink-500 fill-current' : 'text-gray-600'}`} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No photos shared yet</p>
            <p className="text-sm text-gray-400">Upload your first photo to start building your shared gallery</p>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="relative">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                className="w-full max-h-96 object-contain"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-lg font-medium text-gray-800 mb-2">{selectedPhoto.caption}</p>
              <p className="text-sm text-gray-600 mb-4">{formatDate(selectedPhoto.timestamp)}</p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => toggleFavorite(selectedPhoto.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                    selectedPhoto.isFavorite
                      ? 'bg-pink-100 text-pink-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${selectedPhoto.isFavorite ? 'fill-current' : ''}`} />
                  <span>{selectedPhoto.isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
                </button>
                
                <button
                  onClick={() => downloadPhoto(selectedPhoto)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                
                <button
                  onClick={() => deletePhoto(selectedPhoto.id)}
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