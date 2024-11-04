import express from 'express';
import { CameraController } from '../controllers/cameraController';

const router = express.Router();

router.post('/save', CameraController.saveBase64);

export default router;
