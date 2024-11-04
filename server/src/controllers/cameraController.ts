import { Request, Response } from 'express';
// import { saveBase64Str } from '../services/cameraService';

export const CameraController = {
  async saveBase64(req: Request, res: Response) {
    res.status(200).json({ success: true, message: 'Image saved successfully' });
    console.log(req.body);
    // console.log(req.file)

    // Validate request body
    // if (!req.body || !req.body.base64String) {
    //   return res.status(400).json({ success: false, message: 'No base64String provided' });
    // }

    // const { base64String } = req.body;

    // try {
    //   const savedPath = await saveBase64Str(base64String);
    //   res.status(200).json({ success: true, message: 'Image saved successfully', path: savedPath });
    // } catch (err) {
    //   if (err instanceof Error) {
    //     res
    //       .status(500)
    //       .json({ success: false, message: 'Failed to save image', error: err.message });
    //   } else {
    //     res
    //       .status(500)
    //       .json({ success: false, message: 'Failed to save image', error: 'Unknown error' });
    //   }
    // }
  },
};
