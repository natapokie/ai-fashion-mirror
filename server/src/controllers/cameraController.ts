import { Request, Response } from 'express';
import { saveBase64Str } from '../services/cameraService';

export const CameraController = {
  // const cameraService = CameraService();

  async saveBase64(req: Request, res: Response) {
    const { base64String } = req.body;

    try {
      const savedPath = await saveBase64Str(base64String);
      res.status(200).json({ success: true, message: 'Image saved successfully', path: savedPath });
    } catch (err) {
      if (err instanceof Error) {
        res
          .status(500)
          .json({ success: false, message: 'Failed to save image', error: err.message });
      } else {
        res
          .status(500)
          .json({ success: false, message: 'Failed to save image', error: 'Unknown error' });
      }
    }
  },
};
