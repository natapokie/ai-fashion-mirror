import { Request, Response } from 'express';

export const CameraController = {
  async saveImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        console.log('No file uploaded in the request.');
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      console.log('File metadata:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      });

      if (req.file.mimetype !== 'image/jpeg') {
        console.log(`File uploaded is not JPEG, but ${req.file.mimetype}`);
        return res.status(400).json({
          success: false,
          message: `Must upload a JPEG image. Your image is minetype: ${req.file.mimetype}`,
        });
      }

      console.log('Image saved successfully.');
      res.status(200).json({ success: true, message: 'Image saved successfully' });
    } catch (err) {
      console.error('Error saving image:', err);
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
