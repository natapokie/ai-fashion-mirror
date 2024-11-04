import React, { useEffect, useState } from 'react';

const COUNTDOWN_TIMEOUT = 1500;

interface CountdownProps {
  totalCount: number;
  className?: string;
  countdownComplete: () => void;
}

export const Countdown = ({ totalCount, className, countdownComplete }: CountdownProps) => {
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(totalCount);

  useEffect(() => {
    startCountdown();
  }, []);

  const startCountdown = () => {
    setIsCounting(true);
  };

  useEffect(() => {
    console.log('countdown', isCounting, countdown);
    let interval: ReturnType<typeof setInterval>;
    if (countdown > 0 && isCounting) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, COUNTDOWN_TIMEOUT);
    } else if (countdown === 0 && isCounting) {
      setIsCounting(false);
    } else if (countdown === 0) {
      countdownComplete();
      console.log('countdown done!');
    }

    return () => clearInterval(interval);
  }, [isCounting, countdown]);

  return (
    <>
      {countdown !== 0 && (
        <p
          className={`loading-countdown-variable ${className}`}
          style={
            {
              '--loading-duration': `${COUNTDOWN_TIMEOUT}ms`,
              '--loading-iteration-count': `${totalCount}`,
              '--loading-delay': `${totalCount}s`,
            } as React.CSSProperties
          }
        >
          {countdown}
        </p>
      )}
    </>
  );
};
