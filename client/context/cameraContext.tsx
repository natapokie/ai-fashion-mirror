import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type CameraContextType = {
  videoRef: React.RefObject<HTMLVideoElement> | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  takePhoto: () => string;
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

  const takePhoto = () => {
    if (videoRef.current) {
      // canvas element created in memory, not visible
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        // capture photo and draw to canvas
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // convert canvas image to data url (base64 str)
        const dataURL = canvas.toDataURL('image/png');
        console.log('dataURL base64', dataURL);

        return dataURL;
      }
    }
    return '';
  };

  useEffect(() => {
    // initially start up camera
    startCamera();
    // when component unmounts
    return stopCamera;
  }, []);

  return (
    <CameraContext.Provider value={{ videoRef, startCamera, stopCamera, takePhoto }}>
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
