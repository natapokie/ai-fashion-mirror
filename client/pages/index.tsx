import React, { useEffect, useState } from 'react';
import CameraFeed from '@/components/cameraFeed/cameraFeed';
import Carousel from '@/components/carousel/carousel';
import { mockProductData } from '@/utils/mockData';
import Image from 'next/image';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { Countdown } from '@/components/countdown/countdown';
import { Spinner } from '@/components/spinner/spinner';
import { useCamera } from '@/context/cameraContext';
import { saveImage } from '@/services/cameraService';

const closeIcon = '/icons/xmark-solid.svg';

// define states
const pageStates = {
  MAIN: 'MAIN', // main state with click to start bttn
  COUNTDOWN: 'COUNTDOWN', // displays countdown
  SMILE: 'SMILE', // capture photo
  LOADING: 'LOADING', // loading
  RESULTS: 'RESULTS', // displays results
  API_ERROR: 'API_ERROR', // api error page
  ERROR: 'ERROR', // other errors?
};

const Home = () => {
  const { takePhoto } = useCamera();

  const [pageState, setPageState] = useState(pageStates.MAIN);

  const handleStart = () => {
    setPageState(pageStates.COUNTDOWN);
  };

  const closeCarousel = () => {
    setPageState(pageStates.MAIN);
  };

  const onCountdownComplete = () => {
    setPageState(pageStates.SMILE);
  };

  const takePhotoHandler = async () => {
    const formData = await takePhoto();
    if (formData) {
      // Handle the FormData, e.g., send it to a server
      // console.log('FormData captured:', formData);
      console.log(formData.get('image'));

      await saveImage(formData);
    }
  };

  useEffect(() => {
    if (pageState === pageStates.SMILE) {
      setTimeout(() => {
        // after two seconds of SMILE
        // capture photo and parse into form-data for post request...
        takePhotoHandler();

        // TODO: if there is error change state accordinly!
        // display loading state -- only if no errors saving photo
        setPageState(pageStates.LOADING);

        // TODO: call API as well here?
      }, 2000);
    }

    if (pageState === pageStates.LOADING) {
      setPageState(pageStates.RESULTS);
    }
  }, [pageState]);

  return (
    <div className="w-dvw h-dvh overflow-hidden bg-black relative">
      <CameraFeed />

      {pageState === pageStates.MAIN ||
      pageState === pageStates.COUNTDOWN ||
      pageState === pageStates.SMILE ? (
        <button
          onClick={handleStart}
          className="
            bg-white/30 text-white text-3xl font-bold 
            py-4 px-10 rounded-full opacity-90 
            hover:opacity-100 transition-opacity 
            active:bg-white/50 active:scale-95
            select-none
            absolute bottom-[25%] left-1/2 transform -translate-x-1/2 
            z-10 touch-auto cursor-pointer w-[330px]
          "
          style={{ touchAction: 'manipulation' }}
        >
          {pageState === pageStates.MAIN ? (
            'CLICK TO START'
          ) : pageState === pageStates.COUNTDOWN ? (
            <Countdown
              className="z-0 text-3xl font-bold"
              totalCount={3}
              countdownComplete={onCountdownComplete}
            />
          ) : (
            'SMILE!'
          )}
        </button>
      ) : null}

      {pageState === pageStates.LOADING && (
        <div className="w-full h-full flex flex-col justify-center items-center opacity-80">
          <Spinner />
        </div>
      )}

      <AnimatePresence>
        {pageState === pageStates.RESULTS && (
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
