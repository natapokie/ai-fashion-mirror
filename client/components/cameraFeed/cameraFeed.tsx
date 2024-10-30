import React, { useEffect, useRef } from 'react';

const CameraFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = async () => {
    console.log("Attempting to start camera..."); // Debug log
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

    // Clean up the camera stream when the component unmounts
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted // Ensures there’s no audio playback
      className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]"
    />
  );
};

export default CameraFeed;