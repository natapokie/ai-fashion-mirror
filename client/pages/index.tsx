import React, { useState } from 'react';
import CameraFeed from '@/components/cameraFeed/cameraFeed';
import Carousel from '@/components/carousel/carousel';
import { mockProductData } from '@/utils/mockData';

const Home = () => {
  const [showCarousel, setShowCarousel] = useState(false);

  const handleStart = () => {
    setShowCarousel(true);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative">
      <CameraFeed className="absolute top-0 left-0 w-full h-full object-cover z-0" />

      {!showCarousel ? (
        <button
          onClick={handleStart}
          className="
            bg-white/30 text-white text-3xl font-bold 
            py-4 px-10 rounded-full opacity-90 
            hover:opacity-100 transition-opacity 
            active:bg-white/50 active:scale-95
            select-none
            absolute bottom-[25%] left-1/2 transform -translate-x-1/2 
            z-10 touch-auto cursor-pointer
          "
          style={{ touchAction: 'manipulation' }}
        >
          CLICK TO START
        </button>
      ) : (
        <Carousel products={mockProductData} />
      )}
    </div>
  );
};

export default Home;