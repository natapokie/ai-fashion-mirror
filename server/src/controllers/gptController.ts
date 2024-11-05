import { Request, Response } from 'express';
import { GptService } from '../services/gptService';

export const GptController = {
  async ask(req: Request, res: Response) {
    try {
      if (!req.body) {
        return res.status(400).json({ success: false, message: 'Empty body' });
      }

      let gptService = new GptService();
      let data = gptService.doSomething();

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
