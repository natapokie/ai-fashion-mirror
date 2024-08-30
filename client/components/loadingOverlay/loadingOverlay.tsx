import { useEffect, useState } from 'react';
import { Spinner } from '../spinner/spinner';

export const LoadingOverlay = () => {
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);

  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      startCountdown();
      // TODO: wait for the other animations to complete
      // adjust this 3000ms so it's the sum of the smile animation and the taking your photo in..
    }, 3000);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isCounting) {
      interval = setInterval(() => {
        if (countdown > 0) {
          setCountdown((countdown) => (countdown > 0 ? countdown - 1 : countdown));
        } else {
          setIsCounting(false);
          setShowSpinner(true);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isCounting, countdown]);

  const startCountdown = () => {
    setIsCounting(true);
  };

  // TODO: adjust animations...
  // idea: smile, then taking your photo in, then countdown (countdown, scale up and then fade out)
  // TODO: adjust font size
  return (
    <>
      <div className="h-full w-full flex flex-row justify-center items-center">
        {showSpinner ? (
          <Spinner></Spinner>
        ) : (
          <>
            <div className="flex flex-col gap-3 text-center">
              <h1 className="smile-text">Smile!</h1>
              <h2>Taking your photo in...</h2>
              <h1>{countdown}</h1>
            </div>
          </>
        )}
      </div>
    </>
  );
};
