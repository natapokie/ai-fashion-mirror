import { Request, Response } from 'express';

export const CameraController = {
  async saveImage(req: Request, res: Response) {
    console.log(req.body);
    console.log(req.file);

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      if (req.file.mimetype !== 'image/jpeg') {
        return res.status(400).json({ success: false, message: 'Must upload a JPEG image' });
      }

      res.status(200).json({ success: true, message: 'Image saved successfully' });
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
