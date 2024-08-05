import express, { Express, Request, Response } from "express";
import { StillCamera } from "./pi-camera-connect";
import * as fs from "fs";
import axios, { AxiosResponse } from "axios";

// BIG TODO: separate the send api, camera stuff into their own files

const app: Express = express();

// TODO: move to separate env file
const PORT = 8080;

app.get('/', (req, res) => {
    res.send('Hello from the backend (Typescript + Express)!');
});

app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
});

const URL = "https://pre.cm/scribe.php";

interface SocialMediaComments {
    [key: number]: string;
    likes: number;
    views: number;
    comments: number;
}

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
            } catch (err) {
                console.error(`JSOn parse failed ${response.data}`)
            }
        } else {
            console.error(`Upload failed. Status code: ${response.status}`);
            console.error(`Response: ${response.data}`);
        }

        // TODO: send to client via websocket

    } catch (err) {
        console.error(err);
    }
}

const testCamera = async () => {
    console.log("Begin camera test");
    // const stillCamera 

    const stillCamera = new StillCamera({
        width: 450,
        height: 900,
    });

    const image = await stillCamera.takeImage();

    await sendToApi(image);

    fs.writeFileSync("still-image.jpg", image);
    console.log('saved image');
}



testCamera();