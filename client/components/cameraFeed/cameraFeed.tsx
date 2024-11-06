import { useCamera } from '@/context/cameraContext';
import React from 'react';

const CameraFeed: React.FC<{ className?: string }> = ({ className }) => {
  const { videoRef } = useCamera();

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={`absolute top-0 left-0 w-dvw h-dvh object-cover transform scale-x-[-1] ${className}`}
    />
  );
};

export default CameraFeed;
