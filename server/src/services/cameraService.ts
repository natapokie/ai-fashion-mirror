import { Socket } from "socket.io";
import StillCamera from "../pi-camera-connect/lib/still-camera";
import NodeWebcam, { WebcamOptions } from "node-webcam";
import { sendToApi } from "./apiService";
import fs from "fs";
import { SocialMediaComments } from "../utils/types";

const PHOTO_WIDTH = 450;
const PHOTO_HEIGHT = 900;

const OPTS: WebcamOptions = {
    width: 100,
    height: 100,
    quality: 2,
    output: "jpeg",
    device: false,
    callbackReturn: "buffer",
    verbose: false
};

interface PhotoData {
    apiResponse: SocialMediaComments;
    encodedImg: string;
}

export class CameraService {
    photosTaken: number = 0;

    rpiCamera = new StillCamera({
        width: PHOTO_WIDTH,
        height: PHOTO_HEIGHT,
    });
    localCamera = NodeWebcam.create(OPTS);

    initCamera = () => {

    }

    takePhoto = async (socket: Socket) => {
        console.log("Taking a photo...");
        try {
            const photo = await this.rpiCamera.takeImage();
            console.log('Captured photo using rpi camer');

            return await this.photoHandler(photo);
        } catch (err) {
            console.error('RPi Camera Error, using Node Webcam');
            return new Promise<PhotoData | void>((resolve, reject) => {
                this.localCamera.capture('test', async (err, data) => {
                    console.log('Captured photo using webcam');
                    
                    if (!err && data) {
                        console.log('sending data to photoHandler')
                        try {
                            const response = await this.photoHandler(data as Buffer);
                            resolve(response)
                        } catch (err) {
                            reject(err)
                        }
                    } else {
                        console.error('Error taking photo with webcam')
                        reject(err);
                    }
                });
            }); 
        }
    }

    photoHandler = async (photo: Buffer): Promise<PhotoData> => {
        // save the photo locally for testing
        console.log('saving photo locally')
        
        try {
            fs.writeFileSync(`photo_${this.photosTaken}.jpg`, photo);
        } catch (err) {
            console.error(`Failed to save photo locally: ${err}`);
        }
        
        this.photosTaken++;

        let encodedImg = '';
        try {
            encodedImg = Buffer.from(photo).toString('base64');
        } catch (err) {
            console.error(err);
        }

        // return api response
        return {
            apiResponse: await sendToApi(photo),
            encodedImg: encodedImg,
        };
    }
}