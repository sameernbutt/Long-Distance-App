import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, X, RotateCcw, Square } from 'lucide-react';

interface CameraInterfaceProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraInterface({ onCapture, onClose }: CameraInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [recordingTime, setRecordingTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: mediaType === 'video'
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const capturePhoto = () => {
    if (!videoRef.current || !streamRef.current) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    context.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
      }
    }, 'image/jpeg', 0.8);
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    
    const chunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
      onCapture(file);
    };
    
    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    
    // Update recording time every second
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black/50 text-white">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setMediaType('photo')}
            className={`px-4 py-2 rounded-full transition-colors ${
              mediaType === 'photo' ? 'bg-white text-black' : 'bg-black/50 text-white'
            }`}
          >
            <Camera className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMediaType('video')}
            className={`px-4 py-2 rounded-full transition-colors ${
              mediaType === 'video' ? 'bg-white text-black' : 'bg-black/50 text-white'
            }`}
          >
            <Video className="w-5 h-5" />
          </button>
        </div>
        
        <button
          onClick={switchCamera}
          className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Recording Timer */}
        {isRecording && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-mono">
            {formatTime(recordingTime)}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/50">
        <div className="flex justify-center items-center space-x-8">
          {/* Capture Button */}
          <button
            onClick={mediaType === 'photo' ? capturePhoto : (isRecording ? stopRecording : startRecording)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-white hover:bg-gray-200'
            }`}
          >
            {isRecording ? (
              <Square className="w-8 h-8 text-white" />
            ) : (
              <div className={`w-12 h-12 rounded-full border-4 ${
                mediaType === 'photo' ? 'border-gray-800' : 'border-gray-800'
              }`} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
