import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, RotateCcw, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addFeedItem, uploadFile } from '../firebase/feed';
import { getPartnerId } from '../firebase/moods';
import CameraInterface from './CameraInterface';

interface MediaGalleryProps {
  onClose?: () => void;
}

export default function MediaGallery({ onClose }: MediaGalleryProps) {
  const { user, userProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [capturedMedia, setCapturedMedia] = useState<{url: string, file: File, type: 'photo' | 'video'} | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // Create local URL for immediate preview
    const mediaUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });

    // Show preview screen
    setCapturedMedia({ url: mediaUrl, file, type: isVideo ? 'video' : 'photo' });
    setShowPreview(true);
    setCaption('');
  };

  const handleCameraCapture = async (file: File) => {
    if (!user?.uid) return;

    // Determine if it's a photo or video based on mime type
    const isVideo = file.type.startsWith('video/');

    // Create local URL for immediate preview
    const mediaUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });

    // Show preview screen
    setCapturedMedia({ url: mediaUrl, file, type: isVideo ? 'video' : 'photo' });
    setShowPreview(true);
    setCaption('');
  };

  const handleRetake = () => {
    setCapturedMedia(null);
    setShowPreview(false);
    setCaption('');
  };

  const handleApproveAndShare = async () => {
    if (!capturedMedia || !user?.uid || !partnerId) return;

    setIsSharing(true);
    setIsUploading(true);

    try {
      // Upload to Firebase Storage
      const mediaUrl = await uploadFile(capturedMedia.file, user.uid);

      // Add to feed
      const result = await addFeedItem(
        user.uid,
        userProfile?.displayName || user.email || 'Unknown User',
        userProfile?.photoURL || null,
        capturedMedia.type,
        mediaUrl,
        caption.trim() || `Shared with love 💕`
      );
      
      if (result.error) {
        console.error('Failed to share media:', result.error);
        alert(`Failed to share ${capturedMedia.type}. Please try again.`);
      } else {
        // Success - reset state and close
        setCapturedMedia(null);
        setShowPreview(false);
        setCaption('');
        // Close the media gallery and return to feed
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error('Error sharing media:', error);
      alert(`Failed to share ${capturedMedia.type}. Please try again.`);
    } finally {
      setIsSharing(false);
      setIsUploading(false);
    }
  };

  // If showing preview, render preview screen
  if (showPreview && capturedMedia) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Preview Header */}
        <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/90 to-transparent text-white shrink-0">
          <h3 className="text-lg font-semibold drop-shadow-lg">Preview</h3>
        </div>

        {/* Media Preview */}
        <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
          {capturedMedia.type === 'photo' ? (
            <img 
              src={capturedMedia.url} 
              alt="Captured preview" 
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <video 
              src={capturedMedia.url} 
              controls 
              autoPlay
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          )}
        </div>

        {/* Caption Input */}
        <div className="px-4 py-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:bg-white/15 transition-all shadow-lg"
          />
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-6 pb-8 bg-black/90 flex justify-around items-center shrink-0 gap-4">
          <button
            onClick={handleRetake}
            disabled={isSharing || isUploading}
            className="flex flex-col items-center justify-center space-y-2 p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 active:bg-white/30 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <RotateCcw className="w-7 h-7 text-white drop-shadow-lg" />
            <span className="text-sm font-medium text-white">Retake</span>
          </button>
          
          <button
            onClick={handleApproveAndShare}
            disabled={isSharing || isUploading}
            className="flex flex-col items-center justify-center space-y-2 p-4 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 active:from-pink-700 active:to-pink-800 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-xl"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isSharing || isUploading ? (
              <>
                <div className="animate-spin rounded-full h-7 w-7 border-2 border-white border-t-transparent"></div>
                <span className="text-sm font-medium text-white">Sharing...</span>
              </>
            ) : (
              <>
                <Check className="w-7 h-7 text-white drop-shadow-lg" />
                <span className="text-sm font-medium text-white">Share</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Main camera view with gallery access
  return (
    <>
      {/* Hidden file input for camera roll access */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Camera Interface with gallery button overlay */}
      <div className="relative">
        <CameraInterface
          onCapture={handleCameraCapture}
          onClose={() => {}} // Don't allow closing from camera, only from parent
        />
        
        {/* Gallery Access Button (bottom-left overlay) */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="fixed bottom-20 left-4 z-[60] p-3 rounded-xl bg-white/15 backdrop-blur-md border border-white/30 hover:bg-white/25 active:bg-white/35 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-xl"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-label="Open camera roll"
        >
          <ImageIcon className="w-6 h-6 text-white drop-shadow-lg" />
        </button>
      </div>
    </>
  );
}
