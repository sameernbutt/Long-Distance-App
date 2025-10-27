import React, { useState, useEffect } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addFeedItem, uploadFile } from '../firebase/feed';
import { getPartnerId } from '../firebase/moods';
import CameraInterface from './CameraInterface';

export default function MediaGallery() {
  const { user, userProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<{url: string, file: File, type: 'photo' | 'video'} | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Load partner ID
  useEffect(() => {
    const loadData = async () => {
      if (user?.uid) {
        const partner = await getPartnerId(user.uid);
        setPartnerId(partner);
      }
    };

    loadData();
  }, [user?.uid]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    // Always reset the input to allow selecting the same file again
    event.target.value = '';
    
    if (!file || !user?.uid) return;

    // Determine if it's a photo or video based on mime type
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB for video, 5MB for photo
    
    if (file.size > maxSize) {
      alert(`File size too large. Please choose a ${isVideo ? 'video' : 'photo'} under ${isVideo ? '50' : '5'}MB.`);
      return;
    }

    setIsUploading(true);

    try {
      let mediaUrl: string;
      
      if (partnerId) {
        // Upload to Firebase Storage
        const uploadPromise = uploadFile(file, user.uid);
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout')), 60000) // 60s for videos
        );
        
        try {
          mediaUrl = await Promise.race([uploadPromise, timeoutPromise]);
        } catch (uploadError) {
          if (uploadError instanceof Error && uploadError.message === 'Upload timeout') {
            alert('Upload is taking too long. Please check your connection and try again.');
          } else {
            alert(`Failed to upload ${isVideo ? 'video' : 'photo'} to storage. Please try again.`);
          }
          setIsUploading(false);
          return;
        }
      } else {
        // Use local URL for immediate preview
        mediaUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      }

      // Store uploaded media for preview and sharing
      setUploadedMedia({ url: mediaUrl, file, type: isVideo ? 'video' : 'photo' });
      setCaption('');
    } catch (error) {
      console.error('Error uploading media:', error);
      alert(`Failed to upload ${file.type.startsWith('video/') ? 'video' : 'photo'}. Please try again.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraCapture = async (file: File) => {
    setShowCamera(false);
    
    if (!user?.uid) return;

    // Determine if it's a photo or video based on mime type
    const isVideo = file.type.startsWith('video/');

    setIsUploading(true);

    try {
      let mediaUrl: string;
      
      if (partnerId) {
        // Upload to Firebase Storage
        mediaUrl = await uploadFile(file, user.uid);
      } else {
        // Use local URL for immediate preview
        mediaUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      }

      // Store uploaded media for preview and sharing
      setUploadedMedia({ url: mediaUrl, file, type: isVideo ? 'video' : 'photo' });
      setCaption('');
    } catch (error) {
      console.error('Error processing captured media:', error);
      alert(`Failed to process ${isVideo ? 'video' : 'photo'}. Please try again.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleShareMedia = async () => {
    if (!uploadedMedia || !user?.uid || !partnerId) return;

    setIsSharing(true);

    try {
      const result = await addFeedItem(
        user.uid,
        userProfile?.displayName || user.email || 'Unknown User',
        userProfile?.photoURL || null,
        uploadedMedia.type,
        uploadedMedia.url,
        caption.trim() || `Shared with love 💕`
      );
      
      if (result.error) {
        console.error('Failed to share media:', result.error);
        alert(`Failed to share ${uploadedMedia.type}. Please try again.`);
      } else {
        // Success - reset upload state
        setUploadedMedia(null);
        setCaption('');
      }
    } catch (error) {
      console.error('Error sharing media:', error);
      alert(`Failed to share ${uploadedMedia.type}. Please try again.`);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Share Photo/Video</h3>
      
      {/* Upload Preview */}
      {uploadedMedia && (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            {uploadedMedia.type === 'photo' ? (
              <img 
                src={uploadedMedia.url} 
                alt="Upload preview" 
                className="w-full h-64 object-contain"
              />
            ) : (
              <video 
                src={uploadedMedia.url} 
                controls 
                className="w-full h-64 object-contain"
              />
            )}
            <button
              onClick={() => setUploadedMedia(null)}
              className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          
          <button
            onClick={handleShareMedia}
            disabled={isSharing}
            className={`w-full py-2 rounded-lg font-medium transition-colors ${
              isSharing 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-pink-500 text-white hover:bg-pink-600'
            }`}
          >
            {isSharing ? 'Sharing...' : `Share ${uploadedMedia.type === 'photo' ? 'Photo' : 'Video'}`}
          </button>
        </div>
      )}

      {/* Upload Options */}
      {!uploadedMedia && (
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Upload</span>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
          
          <button
            onClick={() => setShowCamera(true)}
            disabled={isUploading}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition-colors"
          >
            <Camera className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Camera</span>
          </button>
        </div>
      )}

      {isUploading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Uploading...</p>
        </div>
      )}

      {/* Camera Interface */}
      {showCamera && (
        <CameraInterface
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
