import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type CameraContextType = {
  videoRef: React.RefObject<HTMLVideoElement> | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  // takePhoto:
};

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream] = useState<MediaStream | null>(null);

  // const startCamera =
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing the camera:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    // initially start up camera
    startCamera();
    // when component unmounts
    return stopCamera;
  }, []);

  return (
    <CameraContext.Provider value={{ videoRef, startCamera, stopCamera }}>
      {children}
    </CameraContext.Provider>
  );
};

export const useCamera = (): CameraContextType => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCamera must be used within a CameraProvider');
  }
  return context;
};
