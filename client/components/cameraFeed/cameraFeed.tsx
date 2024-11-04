import React, { useEffect, useRef } from 'react';

const CameraFeed: React.FC<{ className?: string }> = ({ className }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing the camera:", error);
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={`absolute top-0 left-0 w-svw h-svh object-cover transform scale-x-[-1] ${className}`}
    />
  );
};

export default CameraFeed;