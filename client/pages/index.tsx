import React, { useState } from 'react';
import CameraFeed from '@/components/cameraFeed/cameraFeed';
import Carousel from '@/components/carousel/carousel';
import { mockProductData } from '@/utils/mockData';
import Image from 'next/image';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';

const closeIcon = '/icons/xmark-solid.svg';

const Home = () => {
  const [showCarousel, setShowCarousel] = useState(false);

  const handleStart = () => {
    setShowCarousel(true);
  };

  const closeCarousel = () => {
    setShowCarousel(false); // Reset to the initial state
  };

  return (
    <div className="w-dvw h-dvh overflow-hidden bg-black relative">
      <CameraFeed />

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
      ) : null}

      <AnimatePresence>
        {showCarousel && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.5 }}
            className="w-full h-full flex flex-col justify-end items-center z-10"
          >
            <button
              onClick={closeCarousel}
              className="absolute top-0 right-0 opacity-80 hover:opacity-100 transition-opacity p-4 box-content z-10"
            >
              <Image src={closeIcon} alt="back" width={24} height={24} />
            </button>
            <Carousel products={mockProductData} onClickOutside={closeCarousel} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
