import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client';
import { socket } from './socket';
import { Likes } from '@/components/likes/likes';
import { Comments } from '@/components/comments';

const inter = Inter({ subsets: ['latin'] })

const Home = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // test timer

  // state to determine if we're displaying stuff (true) or not (false)
  const [display, setDisplay] = useState('TESTNG...');

  useEffect(() => {
    console.log("Connecting Socket");
    socket.on('connect', () => {
      console.log(`Connected with socket ${socket.id}`);
    });
    socket.on('photo', (data: any) => {
      console.log('Received photo data from socket');
      setDisplay(data);
    })

    const takePhoto = () => {
      console.log("Taking a photo...");
      socket.emit("take_photo");
    }

    const donePhoto = () => {
      console.log('Completed displaying all comments and likes');
      // setDisplayState(false);
    }

    // set timer -> used for testing (comments/likes process should take two mins)
    intervalRef.current = setInterval(() => {
      takePhoto();
      setTimeout(donePhoto, 2*60*1000);
    }, 2*60*1000);

    return () => {
      console.log("Unmounting Component")
      // TODO: component seems to be unmounting on each refresh?
      // console.log('Disconnecting Socket');
      // socket.disconnect();

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // run once on init

  useEffect(() => {
    // runs every time displayState changes
    console.log('display changed', display);

  }, [display])

  const commentTest = [
    {username: 'user1', comment: 'omg you look so cool!!'},
    {username: 'user2', comment: 'SLAYYY'},
  ];
  const likes = 1234;

  return (
    <>
      <div className='w-screen h-screen p-1 flex flex-col justify-between items-center'>
        <Likes likes={likes}></Likes>
        { display }
        <Comments comments={commentTest}></Comments>
      </div>
    </>
  )
};

export default Home;
