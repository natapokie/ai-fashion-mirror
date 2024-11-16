import { Request, Response } from 'express';
import { GptService } from '../services/gptService';

export const ApiController = {
  async process(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      if (req.file.mimetype !== 'image/jpeg') {
        return res.status(400).json({
          success: false,
          message: `Must upload a JPEG image. Your image is minetype: ${req.file.mimetype}`,
        });
      }

      console.log('successfully saved the image - creating gpt request');

      const gptService = new GptService();
      const data = gptService.doSomething();

      res
        .status(200)
        .json({ success: true, message: 'Successfully processed the api request', data });
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
