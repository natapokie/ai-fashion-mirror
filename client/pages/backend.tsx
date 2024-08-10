import { useEffect, useState } from "react";
import { socket } from "./socket";

const Backend = () => {
    const [img, setImg] = useState<string>('');

    useEffect(() => {
        socket.on("connect", () => {
            console.log(`Connected with socket ${socket.id}`);
        });

        socket.on('send_photo', (data: string) => {
            console.log('Received image data:', data);
            setImg(`data:image/jpeg;base64,${data}`)
        });

        socket.on('api_response', (data: any) => {
            console.log('/backend Received api response from socket');
            console.log(data);
        })

    }, []);

    return (
        <>
            <div>Welcome to the backend ui!</div>
            { img && <img id="image" alt="Received image" src={img}></img> }
        </>
    )
};

export default Backend;