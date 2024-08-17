import { useEffect, useState } from 'react';
import { socket } from './socket';

const Backend = () => {
  const [img, setImg] = useState<string>('');

  useEffect(() => {
    const onConnect = () => {
      console.log(`Connected with socket ${socket.id}`);
    };

    const onSendPhoto = (data: string) => {
      console.log('Received image data');
      setImg(`data:image/jpeg;base64,${data}`);
    };

    const onApiResonse = (data: any) => {
      console.log('/backend Received api response from socket');
      console.log(data);
    };

    socket.on('connect', onConnect);
    socket.on('send_photo', onSendPhoto);
    socket.on('api_response', onApiResonse);

    return () => {
      // cleanup socket event listeners
      socket.off('connect', onConnect);
      socket.off('send_photo', onSendPhoto);
      socket.off('api_response', onApiResonse);
    };
  }, []);

  return (
    <>
      <div>Welcome to the backend ui!</div>
      {img && <img id="image" alt="Received image" src={img}></img>}
    </>
  );
};

export default Backend;