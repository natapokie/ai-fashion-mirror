import StillCamera from '../pi-camera-connect/lib/still-camera';
import NodeWebcam, { WebcamOptions } from 'node-webcam';
import { sendToApi } from './apiService';
import fs from 'fs';
import path from 'path';
import { PhotoData } from '../../../shared/types';

const PHOTO_WIDTH = 450;
const PHOTO_HEIGHT = 900;

const FILE_LOCATION = '../cache_photos/photo.png';

const OPTS: WebcamOptions = {
  width: 100,
  height: 100,
  quality: 2,
  output: 'jpeg',
  device: false,
  callbackReturn: 'buffer',
  verbose: false,
};

export class CameraService {
  photosTaken: number = 0;

  rpiCamera = new StillCamera({
    width: PHOTO_WIDTH,
    height: PHOTO_HEIGHT,
  });
  localCamera = NodeWebcam.create(OPTS);

  initCamera = () => {};

  takePhoto = async () => {
    console.log('Taking a photo...');
    try {
      const photo = await this.rpiCamera.takeImage();
      console.log('Captured photo using rpi camer');

      return await this.photoHandler(photo);
    } catch (err) {
      console.log(err);
      console.error('RPi Camera Error, using Node Webcam');
      return new Promise<PhotoData>((resolve, reject) => {
        this.localCamera.capture('test', async (err, data) => {
          console.log('Captured photo using webcam');

          if (!err && data) {
            console.log('sending data to photoHandler');
            try {
              const response = await this.photoHandler(data as Buffer);
              resolve(response);
            } catch (err) {
              reject(err);
            }
          } else {
            console.error('Error taking photo with webcam');
            reject(err);
          }
        });
      });
    }
  };

  photoHandler = async (photo: Buffer): Promise<PhotoData> => {
    // save the photo locally for testing
    console.log('saving photo locally');

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

    const resp = {} as PhotoData;

    try {
      resp.apiResponse = await sendToApi(photo);
      resp.encodedImg = encodedImg;
    } catch (err) {
      console.error('Error creating PhotoData object.');
      resp.errorMsg = `${err}`;
      resp.encodedImg = encodedImg;
    }

    return resp;
  };
}

export const saveBase64Str = (base64Str: string): Promise<string> => {
  // Base64 => Buffer => Image
  return new Promise((resolve, reject) => {
    try {
      const buffer = Buffer.from(base64Str, 'base64');
      const filePath = path.join(__dirname, FILE_LOCATION, 'photo.png');
      // console.log('__dirname', __dirname)
      console.log('Save base64 str to', filePath);
      fs.writeFileSync(filePath, buffer);
      resolve(filePath);
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
};
