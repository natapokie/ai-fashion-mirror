import { Request, Response } from 'express';
import { GptService } from '../services/gptService';
// import fs from 'fs';

export const ApiController = {
  async process(req: Request, res: Response) {
    try {
      if (!req.file || !req.file?.buffer) {
        return res.status(400).json({ success: false, message: 'Error, no file or no buffer!' });
      }

      console.log('successfully saved the image - creating gpt request');

      // Buffer -> base64
      const encodedImg = req.file.buffer.toString('base64');
      // DEBUG: if you want to check to make sure that the conversion works properly
      // fs.writeFile('debug_base64.txt', encodedImg, (err) => {
      //   if (err) {
      //     console.error('Error writing Base64 string to file:', err);
      //   } else {
      //     console.log('Base64 string saved to debug_base64.txt');
      //   }
      // });

      const gptService = new GptService();
      const data = await gptService.doSomething(encodedImg);

      res
        .status(200)
        .json({ success: true, message: 'Successfully processed the api request', data: data });
    } catch (err) {
      if (err instanceof Error) {
        res
          .status(500)
          .json({ success: false, message: 'Failed to process the request', error: err.message });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to process the request',
          error: 'Unknown error',
        });
      }
    }
  },
};
