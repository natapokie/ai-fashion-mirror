import { useEffect, useRef, useState } from 'react';
import { socket } from '../utils/socket';
import { Likes } from '@/components/likes/likes';
import CommentFeed from '@/components/comments/commentFeed';
import { ResponseData } from '../../shared/types';
import { LoadingOverlay } from '@/components/loadingOverlay/loadingOverlay';
import { EndingOverlay } from '@/components/endingOverlay/endingOverlay';

const Home = () => {
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null); // test timer

  // state to determine if we're displaying stuff (true) or not (false)
  const [display, setDisplay] = useState<ResponseData | void>();
  const [finalLikes, setFinalLikes] = useState<number>(0);

  // state variables to indicate completed animations
  const [likesComplete, setLikesComplete] = useState<boolean>(false);
  const [commentsComplete, setCommentsComplete] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log('Connecting Socket');

    const onConnect = () => {
      console.log(`Connected with socket ${socket.id} on server ${process.env.SERVER_BASE_URL}`);
    };

    const onApiResonse = (data: ResponseData | string) => {
      console.log('Received api response from socket');

      if (typeof data === 'string') {
        // when data is a string (i.e., person not found), stop the loading overlay
        // TODO: maybe display a message? ask prof
        console.error(data);
        setIsLoading(false);

        // wait for a few seconds, and go back to loading screen
        setTimeout(() => {
          setIsLoading(true);
        }, 2000);
      } else {
        setDisplay(data);
        if (data.likes !== undefined) {
          setFinalLikes(data.likes);
        }
      }
    };

    const onErrorMessage = (msg: string) => {
      // on error take a new photo
      console.error(msg);
      takePhoto();
    };

    socket.on('connect', onConnect);
    socket.on('api_response', onApiResonse);
    socket.on('err_msg', onErrorMessage);

    return () => {
      console.log('Unmounting Component');

      // clean up socket event listeners
      socket.off('connect', onConnect);
      socket.off('api_response', onApiResonse);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // run once on init

  useEffect(() => {
    // runs every time displayState changes
    // console.log('display changed', display);
  }, [display]);

  useEffect(() => {
    if (likesComplete && commentsComplete) {
      console.log('Likes and comments animation completed');
      setLikesComplete(false);
      setCommentsComplete(false);

      donePhoto();
    }
    // fire useEffect when either state vars change
  }, [likesComplete, commentsComplete]);

  const takePhoto = () => {
    console.log('Taking a photo...');
    socket.emit('take_photo');
  };

  const donePhoto = () => {
    console.log('Completed displaying all comments and likes');
    console.log('Clearing display');
    setDisplay();
    setIsLoading(false);

    setTimeout(() => {
      console.log('5s passed taking a new photo');
      // TODO: declare this as a const, e.g., WAIT_TIME or better name
      // time we want to wait/stall after the last photo is taken

      setIsLoading(true);
    }, 5000);
  };

  const onLikesComplete = () => {
    setLikesComplete(true);
  };

  const onCommentsComplete = () => {
    setCommentsComplete(true);
  };

  return (
    <>
      <div className="w-screen h-screen flex flex-col justify-between items-center">
        {display ? (
          <>
            <Likes finalLikes={finalLikes} onComplete={onLikesComplete}></Likes>
            <CommentFeed comments={display.comments} onComplete={onCommentsComplete}></CommentFeed>
          </>
        ) : (
          <>
            {isLoading ? (
              <>
                <LoadingOverlay takePhoto={takePhoto}></LoadingOverlay>
              </>
            ) : (
              <EndingOverlay></EndingOverlay>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Home;
