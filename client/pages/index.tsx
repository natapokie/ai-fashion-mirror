import Image from 'next/image';
import { Inter } from 'next/font/google';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { socket } from './socket';
import { Likes } from '@/components/likes/likes';
import { Comments } from '@/components/comments';

const inter = Inter({ subsets: ['latin'] });

const Home = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // test timer

  // state to determine if we're displaying stuff (true) or not (false)
  const [display, setDisplay] = useState('TESTNG...');

  useEffect(() => {
    console.log('Connecting Socket');

    const onConnect = () => {
      console.log(`Connected with socket ${socket.id}`);
    };

    // TODO: add type
    const onApiResonse = (data: any) => {
      console.log('Received api response from socket');
      setDisplay(data);
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
        setTimeout(donePhoto, 2 * 60 * 1000);
      },
      1 * 60 * 1000,
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

  const commentTest = [
    { username: 'user1', comment: 'omg you look so cool!!' },
    { username: 'user2', comment: 'SLAYYY' },
  ];
  const likes = 1234;

  return (
    <>
      <div
        className="w-screen h-screen flex flex-col justify-between items-center bg-cover bg-center h-screen"
        style={{ backgroundImage: `url(https://picsum.photos/1000/500)` }}
      >
        <Likes likes={likes}></Likes>
        {display}
        <Comments comments={commentTest}></Comments>
      </div>
    </>
  );
};

export default Home;
