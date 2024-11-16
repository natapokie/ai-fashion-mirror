/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { Request } from 'express';
import multer, { StorageEngine } from 'multer';
import fs from 'fs';
import path from 'path';

interface CustomFileResult extends Partial<Express.Multer.File> {
  image?: string;
  placeholder?: string;
  bucket?: string;
}

class CustomStorageEngine implements StorageEngine {
  // private getDestination: (req: Request, file: Multer.File, cb: (error: any, destination: string) => void) => void;

  numFilesLimit = 1;
  fileLimit = 20 * 1024 * 1024; // 20MB (GPT-4 Vision limit)
  mimeTypeLimits = ['image/jpeg', 'image/png'];
  destination = path.join(__dirname, '../', '__uploads');

  result: CustomFileResult = {};

  constructor() {}

  // set destination for uploaded file
  getDiskDestination = (
    file: Express.Multer.File,
    cb: (error: any, metadata?: Partial<Express.Multer.File>) => void,
  ) => {
    // Handle potential errors and set the file destination
    try {
      const destinationPath = path.join(this.destination, `${Date.now()}.jpg`);
      const outStream = fs.createWriteStream(destinationPath);

      file.stream.pipe(outStream);
      outStream.on('error', cb);

      outStream.on('finish', () => {
        cb(null, {
          path: destinationPath,
          size: outStream.bytesWritten,
        });
      });
    } catch (error) {
      cb(error); // Pass the error to the callback
    }
  };

  // save to buffer
  getBufferDestination = (
    file: Express.Multer.File,
    cb: (error: any, metadata?: Partial<Express.Multer.File>) => void,
  ) => {
    try {
      const chunks: Buffer[] = [];

      file.stream.on('data', (chunk) => {
        chunks.push(chunk); // Collect chunks of data from the stream
      });

      file.stream.on('end', () => {
        // Concatenate all chunks into a single buffer once the stream ends
        const buffer = Buffer.concat(chunks);

        // Return the buffer and size to the callback
        cb(null, {
          buffer: buffer,
          size: buffer.length,
        });
      });

      file.stream.on('error', (err) => {
        console.error('Error reading file stream:', err);
        cb(err); // Pass the error to the callback
      });
    } catch (error) {
      cb(error);
    }
  };

  _handleFile = (
    req: Request,
    file: Express.Multer.File,
    cb: (err?: any, info?: CustomFileResult) => void,
  ): void => {
    // initialize result
    this.result = {};

    // initial checks for size limits and mimeType
    if (file.size > this.fileLimit) {
      return cb(new Error(`File size exceeds the limit of ${this.fileLimit / (1024 * 1024)} MB`));
    }

    // Validate MIME type
    if (!this.mimeTypeLimits.includes(file.mimetype)) {
      return cb(
        new Error(
          `Invalid file type: ${file.mimetype}. Allowed types are ${this.mimeTypeLimits.join(', ')}`,
        ),
      );
    }

    this.getDiskDestination(file, (err, metadata) => {
      if (err) {
        console.error('Error getting destination path:', err);
        return cb(err); // Return the error if destination path fails
      }

      this.result = { ...this.result, ...metadata };
      console.log('getDestination', this.result);
    });

    this.getBufferDestination(file, (err, metadata) => {
      if (err) {
        console.error('Error getting buffer from file:', err);
        return cb(new Error('Error processing buffer'));
      }

      // Return the file metadata and the buffer after processing
      this.result = { ...this.result, ...metadata };

      console.log('getBufferDestination', this.result);
    });

    console.log('final result', this.result);
    // return final result
    cb(null, this.result);
  };

  _removeFile = (
    _req: Request,
    file: Express.Multer.File & { name: string },
    cb: (error: Error | null) => void,
  ): void => {
    // Attempt to delete the file from the filesystem
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        return cb(err); // Pass the error to the callback if deletion fails
      }
      console.log('File successfully deleted:', file.path);
      cb(null); // No error
    });
  };
}

const customStorage = new CustomStorageEngine();

export const upload = multer({
  storage: customStorage,
});
