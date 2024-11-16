/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { Request } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

interface CustomFileResult extends Partial<Express.Multer.File> {
  image?: string;
  placeholder?: string;
  bucket?: string;
}

class CustomStorageEngine implements multer.StorageEngine {
  // private getDestination: (req: Request, file: Multer.File, cb: (error: any, destination: string) => void) => void;

  numFilesLimit = 1;
  fileLimit = 20 * 1024 * 1024; // 20MB (GPT-4 Vision limit)
  mimeTypeLimits = ['image/jpeg', 'image/png'];
  destination = path.join(__dirname, '../', '__uploads');

  constructor() {}

  getDestination = (
    req: Request,
    file: Express.Multer.File,
    cb: (error: any, destination?: string) => void,
  ) => {
    cb(null, path.join(this.destination, `${Date.now()}.jpg`));
  };

  getBufferDestination = (
    req: Request,
    file: Express.Multer.File,
    cb: (error: any, buffer?: Buffer) => void,
  ) => {
    const chunks: Buffer[] = [];
    file.stream.on('data', (chunk) => {
      console.log('data chunk', typeof chunk);
      chunks.push(chunk);
    });
    file.stream.on('end', () => {
      console.log('on end');
      const buffer = Buffer.concat(chunks);
      cb(null, buffer);
    });
    file.stream.on('error', (err) => cb(err));
  };

  _handleFile = (
    req: Request,
    file: Express.Multer.File,
    cb: (err?: any, info?: CustomFileResult) => void,
  ): void => {
    this.getDestination(req, file, (err, destinationPath) => {
      if (err) return cb(err);

      console.log('file', file, destinationPath);

      if (destinationPath) {
        const outStream = fs.createWriteStream(destinationPath);

        // Pipe the file stream to the destination
        file.stream.pipe(outStream);

        // Handle errors during file writing
        outStream.on('error', (err) => cb(err));

        // On successful file writing, call the callback with the file metadata
        outStream.on('finish', () => {
          console.log('on finish', destinationPath);
          if (destinationPath) {
            const imageStream = fs.createReadStream(destinationPath);

            const chunks: Buffer[] = [];
            imageStream.on('data', (data) => {
              if (typeof data === 'string') {
                // Convert string to Buffer assuming UTF-8 encoding
                chunks.push(Buffer.from(data, 'utf-8'));
              } else if (data instanceof Buffer) {
                chunks.push(data);
              } else {
                // Convert other data types to JSON and then to a Buffer
                const jsonData = JSON.stringify(data);
                chunks.push(Buffer.from(jsonData, 'utf-8'));
              }
            });

            imageStream.on('end', () => {
              return cb(null, {
                path: destinationPath,
                size: outStream.bytesWritten,
                buffer: Buffer.concat(chunks),
                filename: destinationPath,
              });
            });
            imageStream.on('error', () => {
              cb(new Error('Error saving to buffer'));
            });
          }
        });
      }
    });
  };

  _removeFile = (
    _req: Request,
    file: Express.Multer.File & { name: string },
    cb: (error: Error | null) => void,
  ): void => {
    fs.unlink(file.path, cb);
  };
}

const customStorage = new CustomStorageEngine();

export const upload = multer({
  storage: customStorage,
});
