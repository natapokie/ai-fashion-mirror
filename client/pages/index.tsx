import React from 'react';
import CameraFeed from '@/components/cameraFeed/cameraFeed';

const Home = () => {
  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative">
      <CameraFeed /> {/* This renders the live camera feed as background */}
      <button
        onClick={() => console.log("Button clicked")}
        className="
          bg-white/30 text-white text-3xl font-bold 
          py-4 px-10 rounded-full opacity-90 
          hover:opacity-100 transition-opacity 
          active:bg-white/50 active:scale-95
          select-none
          absolute bottom-[25%] left-1/2 transform -translate-x-1/2 touch-auto cursor-pointer
        "
        style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
      >
        CLICK TO START
      </button>
    </div>
  );
};

export default Home;