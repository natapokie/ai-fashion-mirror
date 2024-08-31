import { useEffect, useState } from 'react';
import { Spinner } from '../spinner/spinner';

interface LoadingOverlayProps {
  takePhoto: () => void;
}

export const LoadingOverlay = ({ takePhoto }: LoadingOverlayProps) => {
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      startCountdown();
      // wait for the other animations to complete
    }, 3000);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isCounting) {
      if (countdown > 0) {
        interval = setInterval(() => {
          setCountdown((countdown) => countdown - 1);
        }, 1500);
      } else {
        setIsCounting(false);
        setShowSpinner(true);
      }
    } else {
      console.log('Counter done, taking photo.');
      takePhoto();
    }

    return () => clearInterval(interval);
  }, [isCounting, countdown]);

  const startCountdown = () => {
    setIsCounting(true);
  };

  // TODO: adjust font size
  return (
    <>
      <div className="h-full w-full flex flex-row justify-center items-center">
        {showSpinner ? (
          <Spinner></Spinner>
        ) : (
          <>
            <div className="flex flex-col gap-3 text-center">
              <h1 className="loading-title">Smile!</h1>
              <h2 className="loading-subtitle">Taking your photo in...</h2>
              <h1 className="loading-countdown">{countdown}</h1>
            </div>
          </>
        )}
      </div>
    </>
  );
};
