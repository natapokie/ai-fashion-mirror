import { useEffect, useRef, useState } from 'react';

import { socket } from '../utils/socket';
import { Likes } from '@/components/likes/likes';
import CommentFeed from '@/components/comments/commentFeed';
import { ResponseData } from '../../shared/types';
import { LoadingOverlay } from '@/components/loadingOverlay/loadingOverlay';

const Home = () => {
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null); // test timer

  // state to determine if we're displaying stuff (true) or not (false)
  const [display, setDisplay] = useState<ResponseData | void>();
  const [finalLikes, setFinalLikes] = useState<number>(0);

  // state variables to indicate completed animations
  const [likesComplete, setLikesComplete] = useState<boolean>(false);
  const [commentsComplete, setCommentsComplete] = useState<boolean>(false);

  // TODO: add another state to indicate loading -> isLoading/setIsLoading
  // we don't want to display the loading overlay immediately after the photo is done,
  // lets have like a 5s stall time before we show the loading overlay

  useEffect(() => {
    console.log('Connecting Socket');

    const onConnect = () => {
      console.log(`Connected with socket ${socket.id} on server ${process.env.SERVER_BASE_URL}`);
    };

    const onApiResonse = (data: ResponseData | string) => {
      console.log('Received api response from socket');

      if (typeof data === 'string') {
        // when data is a string (i.e., person not found), take a new photo
        console.error(data);
        takePhoto();
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

    // take the first photo
    takePhoto();

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

  // TODO: need to ensure that the photo is taken once countdown on loading overlay completes
  // idea: pass this function as a prop to loading overlay, call fuction once the countdownn reaches 0
  const takePhoto = () => {
    console.log('Taking a photo...');
    socket.emit('take_photo');
  };

  const donePhoto = () => {
    console.log('Completed displaying all comments and likes');
    console.log('Clearing display');
    setDisplay();

    // TODO: here make sure isLoading is false

    setTimeout(() => {
      console.log('5s passed taking a new photo');
      takePhoto();
      // TODO: declare this as a const, e.g., WAIT_TIME or better name
      // time we want to wait/stall after the last photo is taken

      // TODO: here set isLoading is true
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
            {/* TODO: add a ternary operator for isLoading, display LoadingOverlay if true, otherwise display nothing */}
            <LoadingOverlay></LoadingOverlay>
          </>
        )}
      </div>
    </>
  );
};

export default Home;
