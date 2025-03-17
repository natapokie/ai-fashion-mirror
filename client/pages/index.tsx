import React, { useEffect, useState } from 'react';
import CameraFeed from '@/components/cameraFeed/cameraFeed';
import Carousel from '@/components/carousel/carousel';
import Image from 'next/image';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { Countdown } from '@/components/countdown/countdown';
import { Spinner } from '@/components/spinner/spinner';
import { useCamera } from '@/context/cameraContext';
import { ProductData } from '../../shared/types';
import { sendToGpt } from '@/services/gptService';
import { ErrorPopup } from '@/components/errorPopup/errorPopup';
import { DISCLAIMER_MSG } from '@/utils/constants';

const closeIcon = '/icons/xmark-solid.svg';

// define states
const pageStates = {
  MAIN: 'MAIN', // main state with click to start button
  COUNTDOWN: 'COUNTDOWN', // displays countdown
  SMILE: 'SMILE', // capture photo
  LOADING: 'LOADING', // loading
  RESULTS: 'RESULTS', // displays results
  ERROR: 'ERROR', // error state with popup
};

const Home = () => {
  const { takePhoto } = useCamera();

  const [pageState, setPageState] = useState(pageStates.MAIN);
  const [productInfo, setProductInfo] = useState<ProductData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // error message

  const handleStart = () => {
    console.log('Starting countdown...');
    setPageState(pageStates.COUNTDOWN);
  };

  const closeCarousel = () => {
    console.log('Closing carousel and returning to main state.');
    setPageState(pageStates.MAIN);
  };

  const onCountdownComplete = () => {
    console.log('Countdown complete. Moving to SMILE state...');
    setPageState(pageStates.SMILE);
  };

  const closeErrorPopup = () => {
    setErrorMessage(null);
    setPageState(pageStates.MAIN); // change state to main after user clicks OK
  };

  const takePhotoHandler = async () => {
    console.log('Attempting to capture photo...');
    try {
      const formData = await takePhoto();
      if (formData) {
        console.log('Photo captured successfully.');
        console.log('FormData contains image:', formData.get('image'));

        // call one endpoint that does all processing
        const recommendations = await sendToGpt(formData);
        console.log('Final recommendations from backend: ', recommendations);

        setProductInfo(recommendations);
        setPageState(pageStates.RESULTS);
        console.log('showing carousel');

        // Validate product URLs in the background
        const validateImageUrls = async (products: ProductData[]) => {
          const invalidProducts: ProductData[] = [];

          for (const product of products) {
            try {
              const response = await fetch(product.image, { method: 'HEAD' });
              if (!response.ok) {
                invalidProducts.push(product);
              }
            } catch (err) {
              console.error(`Error validating URL for product: ${product.name}`, err);
              invalidProducts.push(product);
            }
          }

          return invalidProducts;
        };

        const invalidProducts = await validateImageUrls(productInfo);

        if (invalidProducts.length > 0) {
          setErrorMessage('Some product links are invalid. Please try again later.');
          setPageState(pageStates.ERROR);
        }
      } else {
        console.log('No FormData generated by takePhoto.');
        setErrorMessage('No photo captured. Please try again.');
        setPageState(pageStates.ERROR);
      }
    } catch (error) {
      console.error('Error in takePhotoHandler:', error);

      // Use type narrowing to safely check for response data
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'error' in error.response.data
      ) {
        setErrorMessage(
          `Server error: ${String(error.response.data.error)}. Please try again later.`,
        );
      } else {
        setErrorMessage('Something went wrong with the server photo. Please try again.');
      }
      setPageState(pageStates.ERROR);
    }
  };

  useEffect(() => {
    console.log('Current page state:', pageState);

    if (pageState === pageStates.SMILE) {
      console.log('Entering SMILE state, setting timeout for photo capture...');
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

    // if (pageState === pageStates.LOADING) {
    //   console.log('Photo captured, now in LOADING state...');
    //   setPageState(pageStates.RESULTS);
    // }
  }, [pageState]);

  return (
    <div className="w-dvw h-dvh overflow-hidden bg-black relative">
      {pageState === pageStates.MAIN ? (
        <span className="absolute bottom-0 left-0 text-[12px] w-[40%] z-50">{DISCLAIMER_MSG}</span>
      ) : (
        <></>
      )}

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

      {pageState === pageStates.ERROR && errorMessage && (
        <ErrorPopup message={errorMessage} onClose={closeErrorPopup} />
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
            <Carousel products={productInfo} onClickOutside={closeCarousel} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
