import { useState, useRef, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';

interface CameraInterfaceProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const MAX_RECORDING_TIME = 60; // 1 minute in seconds

export default function CameraInterface({ onCapture, onClose }: CameraInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressThreshold = 200; // milliseconds to distinguish tap from hold

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
        audio: true // Always enable audio for video recording capability
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
    
    // Update recording time every second and stop at max time
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1;
        if (newTime >= MAX_RECORDING_TIME) {
          stopRecording();
        }
        return newTime;
      });
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

  // Snapchat-style button handlers
  const handleButtonDown = () => {
    setIsPressed(true);
    
    // Start a timer to detect long press
    pressTimerRef.current = setTimeout(() => {
      // Long press detected - start video recording
      startRecording();
    }, longPressThreshold);
  };

  const handleButtonUp = () => {
    setIsPressed(false);
    
    // Clear the long press timer
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    
    // If recording, stop it
    if (isRecording) {
      stopRecording();
    } else {
      // Quick tap - take photo
      capturePhoto();
    }
  };

  const handleButtonCancel = () => {
    setIsPressed(false);
    
    // Clear the long press timer
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    
    // If recording, stop it
    if (isRecording) {
      stopRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col safe-area-inset">
      {/* Header */}
      <div className="flex justify-between items-center p-3 bg-gradient-to-b from-black/80 to-transparent text-white shrink-0">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 active:bg-white/30 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Close camera"
        >
          <X className="w-5 h-5 drop-shadow-lg" />
        </button>
        
        <button
          onClick={switchCamera}
          className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 active:bg-white/30 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Switch camera"
        >
          <RotateCcw className="w-5 h-5 drop-shadow-lg" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Recording Timer and Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-mono shadow-xl">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-sm" />
            <span className="font-semibold">{formatTime(recordingTime)} / {formatTime(MAX_RECORDING_TIME)}</span>
          </div>
        )}

        {/* Instructions */}
        {!isRecording && !isPressed && (
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-5 py-2 rounded-full text-xs text-center whitespace-nowrap shadow-lg border border-white/10">
            Tap for photo • Hold for video
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 pb-8 bg-gradient-to-t from-black/90 via-black/60 to-transparent shrink-0">
        <div className="flex justify-center items-center">
          {/* Capture Button with Snapchat-style interaction */}
          <button
            onMouseDown={handleButtonDown}
            onMouseUp={handleButtonUp}
            onMouseLeave={handleButtonCancel}
            onTouchStart={handleButtonDown}
            onTouchEnd={handleButtonUp}
            onTouchCancel={handleButtonCancel}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-150 focus:outline-none shadow-2xl ${
              isRecording 
                ? 'bg-red-500 scale-110 shadow-red-500/50' 
                : isPressed
                  ? 'bg-white scale-95 shadow-white/30'
                  : 'bg-white shadow-white/20'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label={isRecording ? 'Stop recording' : 'Take photo or hold to record video'}
          >
            <div className={`rounded-full border-4 transition-all duration-150 ${
              isRecording 
                ? 'w-8 h-8 bg-white border-white' 
                : 'w-16 h-16 border-gray-800'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
}
