import { useEffect, useState } from 'react';
import * as ClienConstants from '../../utils/constants';

interface LikesProps {
  finalLikes: number;
  onComplete: () => void;
}

export const Likes = ({ finalLikes, onComplete }: LikesProps) => {
  const [animatedLikes, setAnimatedLikes] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    // TODO: remove setTimeout and call this in the right place after countdown has completed
    // idea: probably add this when the animated likes has reached final likes
    setTimeout(() => {
      console.log('Likes animations complete');
      onComplete();
    }, 8_000);
  }, []);

  useEffect(() => {
    let incrementTimeoutId: ReturnType<typeof setTimeout>;
    let pauseTimeoutId: ReturnType<typeof setTimeout>;
    let isIncrementing = true;

    const randomDelay = (min: number, max: number) => Math.random() * (max - min) + min;
    const animationDuration = randomDelay(
      ClienConstants.ANIMATION_DURATION_LOWER,
      ClienConstants.ANIMATION_DURATION_UPPER,
    ); // random duration (ms) to continue animation for

    const pauseDuration = randomDelay(
      ClienConstants.PAUSE_DURATION_LOWER,
      ClienConstants.PAUSE_DURATION_UPPER,
    ); // random duration (ms) to puase animation for

    const initPauseTimeout = (shouldPause: boolean, timeoutDuration: number) => {
      return setTimeout(
        () => {
          clearInterval(incrementTimeoutId);
          isIncrementing = shouldPause;
          setIsAnimating(shouldPause);
          incrementLikes(); // call again to switch between animation and pause
        },
        timeoutDuration, // continues animation or puase for a random duration
      );
    };

    const incrementLikes = () => {
      if (isIncrementing) {
        setIsAnimating(true);
        incrementTimeoutId = setInterval(() => {
          setAnimatedLikes((prevLikes) => {
            const newLikes = prevLikes + ClienConstants.LIKES_INCREMENT_STEP;
            if (newLikes >= finalLikes) {
              clearInterval(incrementTimeoutId);
              setIsAnimating(false); // stop animation when finalLikes is reached (heart stops pulsing)
              return finalLikes;
            } else {
              return newLikes;
            }
          });
        }, ClienConstants.LIKES_INCREMENT_DELAY); // increase displayed likes by LIKES_INCREMENT_STEP every 15 ms

        pauseTimeoutId = initPauseTimeout(false, animationDuration); // pause after animationDuration
      } else {
        pauseTimeoutId = initPauseTimeout(true, pauseDuration); // resume animation after pauseDuration
      }
    };

    setAnimatedLikes(0); // reset to displayed likes to 0 every time finalLikes is updated

    const startAnimation = setTimeout(() => {
      setIsAnimating(true);
      incrementLikes();
    }, ClienConstants.LIKES_ANIMATION_DELAY);

    return () => {
      clearInterval(incrementTimeoutId);
      clearTimeout(pauseTimeoutId);
      clearTimeout(startAnimation);
    };
  }, [finalLikes]); // reset when finalLikes is updated

  return (
    <div className="w-full h-16 flex items-center justify-center">
      <div className="flex items-center mt-8 relative -translate-x-32">
        <h2 className={`font-bold ${isAnimating ? 'animate-pulse' : ''}`}>❤️</h2>
        <h2 className="font-bold ml-2 w-20 text-left">{animatedLikes}</h2>
      </div>
    </div>
  );
};
