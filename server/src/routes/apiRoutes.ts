import express from 'express';
import { ApiController } from '../controllers/apiController';
import { upload } from '../multer';

const router = express.Router();

router.post('/request', upload.single('image'), ApiController.process);

export default router;
