import { useEffect, useState } from 'react';
import { LIKES_INCREMENT_STEP, LIKES_INCREMENT_DELAY } from '../..//utils/constants';
import { LikesDisplay } from './likesDisplay';

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
    const animationDuration = randomDelay(1000, 2000); // random duration (ms) to continue animation for
    const pauseDuration = randomDelay(2000, 3000); // random duration (ms) to puase animation for

    const incrementLikes = () => {
      if (isIncrementing) {
        setIsAnimating(true);
        incrementTimeoutId = setInterval(() => {
          setAnimatedLikes((prevLikes) => {
            const newLikes = prevLikes + LIKES_INCREMENT_STEP;
            if (newLikes >= finalLikes) {
              clearInterval(incrementTimeoutId);
              setIsAnimating(false); // stop animation when finalLikes is reached (heart stops pulsing)
              return finalLikes;
            } else {
              return newLikes;
            }
          });
        }, LIKES_INCREMENT_DELAY); // increase displayed likes by LIKES_INCREMENT_STEP every 15 ms

        pauseTimeoutId = setTimeout(
          () => {
            clearInterval(incrementTimeoutId);
            isIncrementing = false;
            setIsAnimating(false);
            incrementLikes(); // call again to pause animation
          },
          animationDuration, // continues animation for a random duration
        );
      } else {
        // Pause for a random duration
        pauseTimeoutId = setTimeout(
          () => {
            clearInterval(incrementTimeoutId);
            isIncrementing = true;
            setIsAnimating(true);
            incrementLikes(); // call again to continue animation
          },
          pauseDuration, // pauses animation for a random duration
        );
      }
    };

    setAnimatedLikes(0); // reset to displayed likes to 0 every time finalLikes is updated

    const startAnimation = setTimeout(() => {
      setIsAnimating(true);
      incrementLikes();
    }, 4000);

    return () => {
      clearInterval(incrementTimeoutId);
      clearTimeout(pauseTimeoutId);
      clearTimeout(startAnimation);
    };
  }, [finalLikes]); // reset when finalLikes is updated

  return <LikesDisplay animatedLikes={animatedLikes} isAnimating={isAnimating} />;
};
