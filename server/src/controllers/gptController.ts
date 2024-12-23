import { Request, Response } from 'express';
import { GptService } from '../services/gptService';

export const GptController = {
  async ask(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'no file available' });
      }

      const gptService = new GptService();
      const data = await gptService.sendToGpt(req.file.buffer.toString('base64'));
      // nov 6 NOTE:
      // in order to obtain buffer, multer.ts must be changed to use memory storage instead of disk storage
      // this might not be ideal since we are saving images to server
      // need workaround
      // claude has some solutions for me to try, check multer.ts

      res.status(200).json({ success: true, message: 'Reached the backend successfully', data });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ success: false, message: 'Failed to ask gpt', error: err.message });
      } else {
        res
          .status(500)
          .json({ success: false, message: 'Failed to ask gpt', error: 'Unknown error' });
      }
    }
  },
};
