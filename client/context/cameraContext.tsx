import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export type CameraContextType = {
  videoRef: React.RefObject<HTMLVideoElement> | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  takePhoto: () => Promise<FormData | undefined> | undefined;
};

export const CameraContext = createContext<CameraContextType | undefined>(undefined);

export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream] = useState<MediaStream | null>(null);

  // const startCamera =
  const startCamera = async () => {
    try {
      console.log('startCamera');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        console.log('setting video stream...');
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing the camera:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      console.log('stopCamera');
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const takePhoto = (): Promise<FormData | undefined> | undefined => {
    if (videoRef.current) {
      // canvas element created in memory, not visible
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        // capture photo and draw to canvas
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        return new Promise((resolve) => {
          canvas.toBlob(
            (blob) => {
              console.log('convertting to form-data');
              if (blob) {
                console.log('blob', blob);
                const formData = new FormData();
                formData.append('image', blob, 'capture.jpg');

                console.log('[DEBUG]', formData.get('image'));
                resolve(formData);
              } else {
                console.error('No blob!');
                resolve(undefined);
              }
            },
            'image/jpeg',
            0.95,
          );
        });
      }
      console.error('Context not defined!');
    }
    console.error('Could not access videoRef!');
    return undefined;
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
