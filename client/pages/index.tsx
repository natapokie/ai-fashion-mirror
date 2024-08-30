import { useEffect, useRef, useState } from 'react';

import { socket } from '../utils/socket';
import { Likes } from '@/components/likes/likes';
import CommentFeed from '@/components/comments/commentFeed';
import { ResponseData } from '../../shared/types';

const Home = () => {
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null); // test timer

  // state to determine if we're displaying stuff (true) or not (false)
  const [display, setDisplay] = useState<ResponseData | void>();
  const [finalLikes, setFinalLikes] = useState<number>(0);

  // state variables to indicate completed animations
  const [likesComplete, setLikesComplete] = useState<boolean>(false);
  const [commentsComplete, setCommentsComplete] = useState<boolean>(false);

  const takePhoto = () => {
    console.log('Taking a photo...');
    socket.emit('take_photo');
  };

  const donePhoto = () => {
    console.log('Completed displaying all comments and likes');
    console.log('Clearing display');
    setDisplay();

    setTimeout(() => {
      console.log('5s passed taking a new photo');
      takePhoto();
      // TODO: declare this as a const, e.g., WAIT_TIME or better name
      // time we want to wait/stall after the last photo is taken
    }, 5000);
  };

  const onLikesComplete = () => {
    setLikesComplete(true);
  };

  const onCommentsComplete = () => {
    setCommentsComplete(true);
  };

  useEffect(() => {
    console.log('Connecting Socket');

    const onConnect = () => {
      console.log(`Connected with socket ${socket.id} on server ${process.env.SERVER_BASE_URL}`);
    };

    const onApiResonse = (data: ResponseData) => {
      console.log('Received api response from socket');
      setDisplay(data);
      if (data.likes !== undefined) {
        setFinalLikes(data.likes);
      }
    };

    socket.on('connect', onConnect);
    socket.on('api_response', onApiResonse);

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

  return (
    <>
      <div className="w-screen h-screen flex flex-col justify-between items-center bg-cover bg-center h-screen">
        {display ? (
          <>
            <Likes finalLikes={finalLikes} onComplete={onLikesComplete}></Likes>
            <CommentFeed comments={display.comments} onComplete={onCommentsComplete}></CommentFeed>
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default Home;
