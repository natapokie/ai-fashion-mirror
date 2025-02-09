import express from 'express';
import { GptController } from '../controllers/gptController';
import { upload } from '../multer';

const router = express.Router();

router.post('/ask', upload.single('image'), GptController.ask);
router.post('/request-rag', GptController.requestRAG);

export default router;
