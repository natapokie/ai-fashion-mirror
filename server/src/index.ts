import express, { Express, Request, Response } from "express";
import { StillCamera } from "./pi-camera-connect";
import * as fs from "fs";
import axios, { AxiosResponse } from "axios";
import { Server, Socket } from "socket.io";
import cors from "cors";
import http from "http";
import path from "path";

// BIG TODO: separate the send api, camera stuff into their own files

const app: Express = express();
// const http = require('http');
const server = http.createServer(app);
// const cors = require('cors');

// enable cors
app.use(cors());

// init socket
// const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
    },
    transports: ["websocket", "polling"],
});

// TODO: move to separate env file
const PORT = 8080;

app.get('/', (req, res) => {
    // res.send('Hello from the backend (Typescript + Express)!');
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket: Socket) => {
    console.log(`Socket ${socket.id} connected.`);

    const sendToApi = async (buffer: Buffer) => {
        try {
    
            const imgBlob = new Blob([buffer], { type: 'image/jpeg' });
    
            const form = new FormData();
            form.append('imagepageim[]', imgBlob);
            form.append('socialfollow', '1000000');
            form.append('socialtype', 'fashion');
            form.append('api', 'api');
            form.append('submit', 'submit');
    
            const response: AxiosResponse = await axios.post(URL, form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
    
            // console.log(response)
    
            if (response.status === 200) {
                try {
                    const data: SocialMediaComments = await response.data;
                    console.log('JSON parse success!')
                    console.log(data)
    
                    // TODO: parse resp obj into a more readable format for the ui
    
                    // TODO: send to client via websocket
                    socket.emit("photo", JSON.stringify(data))
                } catch (err) {
                    console.error(`JSOn parse failed ${response.data}`)
                }
            } else {
                console.error(`Upload failed. Status code: ${response.status}`);
                console.error(`Response: ${response.data}`);
            }
    
            
    
        } catch (err) {
            console.error(err);
        }
    }
    
    // used for testing
    let photosTaken = 0;
    
    const testCamera = async () => {
        console.log("Taking a photo...");
        console.log("Photos taken:", photosTaken);
        // const stillCamera 
    
        const stillCamera = new StillCamera({
            width: 450,
            height: 900,
        });
    
        const image = await stillCamera.takeImage();
    
        // send the image to the localhost:8080 so we can display the img we just took
        // socket.emit("send_photo", );

        await sendToApi(image);
    
        fs.writeFileSync(`still-image_${photosTaken}.jpg`, image);

        // TODO: want to display all the photos onto post:8080
        // socket is connecting and ids are matching up, but callback on send_photo event is not running
        const encodedImg = image.toString('base64');
        socket.emit("send_photo", encodedImg);

        console.log('saved image');
        photosTaken++;
    }

    socket.on("take_photo", testCamera)

    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected.`);
    })
})

server.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
});

const URL = "https://pre.cm/scribe.php";

interface SocialMediaComments {
    [key: number]: string;
    likes: number;
    views: number;
    comments: number;
}





// testCamera();