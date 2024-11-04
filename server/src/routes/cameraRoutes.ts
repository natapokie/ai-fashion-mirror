import express from 'express';
import { CameraController } from '../controllers/cameraController';
import { upload } from '../multer';

const router = express.Router();

// uploaded file is located in the "file" field of the formData obj
router.post('/save', upload.single('image'), CameraController.saveBase64);

export default router;
