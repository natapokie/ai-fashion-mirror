import { useEffect, useRef, useState } from 'react';
import { socket } from '../utils/socket';
import { Likes } from '@/components/likes/likes';
import CommentFeed from '@/components/comments/commentFeed';
import { ResponseData } from '../../shared/types';

const inter = Inter({ subsets: ['latin'] });

const mockResponseData: ResponseData = {
  comments : [
      { user: 'user1', text: 'comment1', displayTime: 1 },
      { user: 'user2', text: 'comment2', displayTime: 2 },
      { user: 'user3', text: 'comment3', displayTime: 3 },
      { user: 'user4', text: 'comment4', displayTime: 4 },
  ],
  likes: 100,
  views: 1000,
  commentsCount: 4,
};

const Home = () => {
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null); // test timer

  // state to determine if we're displaying stuff (true) or not (false)
  const [display, setDisplay] = useState<ResponseData | string>('TESTNG...');

  useEffect(() => {
    console.log('Connecting Socket');

    const onConnect = () => {
      console.log(`Connected with socket ${socket.id} on server ${process.env.SERVER_BASE_URL}`);
    };

    const onApiResonse = (data: ResponseData) => {
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

  const likes = 1234;

  return (
    <>
      <div
        className="w-screen h-screen flex flex-col justify-between items-center bg-cover bg-center h-screen"
        style={{ backgroundImage: `url(https://picsum.photos/1000/500)` }}
      >
        <Likes likes={likes}></Likes>

        {typeof display === 'string' ? (
          <p>{display}</p>
        ) : (
          <div>
            <p>Likes: {display.likes}</p>
            <p>Views: {display.views}</p>
            <p>Comments Count: {display.commentsCount}</p>

            {/* Render the comments */}
            <div>
              <h3>Comments:</h3>
              {display.comments.length > 0 ? (
                display.comments.map((comment, index) => (
                  <div key={index}>
                    <p>{comment.text}</p>
                  </div>
                ))
              ) : (
                <p>No comments available.</p>
              )}
            </div>
            <CommentFeed comments={display.comments}></CommentFeed>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
