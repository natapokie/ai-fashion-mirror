import { useEffect, useRef, useState } from 'react';

import { socket } from '../utils/socket';
import { Likes } from '@/components/likes/likes';
import CommentFeed from '@/components/comments/commentFeed';
import { ResponseData } from '../../shared/types';

const Home = () => {
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null); // test timer

  // state to determine if we're displaying stuff (true) or not (false)
  const [display, setDisplay] = useState<ResponseData | undefined>();
  const [finalLikes, setFinalLikes] = useState<number>(0);

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

    const takePhoto = () => {
      console.log('Taking a photo...');
      socket.emit('take_photo');
    };

    const donePhoto = () => {
      console.log('Completed displaying all comments and likes');
      // setDisplayState(false);
    };

    // set timer -> used for testing (comments/likes process should take two mins)
    intervalRef.current = setInterval(
      () => {
        takePhoto();
        setTimeout(donePhoto, 2 * 1 * 1000);
      },
      1 * 20 * 1000,
    );

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
    console.log('display changed', display);
  }, [display]);

  return (
    <>
      <div className="w-screen h-screen flex flex-col justify-between items-center bg-cover bg-center h-screen">
        {display ? (
          <>
            <Likes finalLikes={finalLikes}></Likes>
            <CommentFeed comments={display.comments}></CommentFeed>
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default Home;
