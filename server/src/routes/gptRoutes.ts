import express from 'express';
import { GptController } from '../controllers/gptController';
import { upload } from '../multer';

const router = express.Router();

// router.post('/ask', upload.single('image'), GptController.ask);
// router.post('/request-rag', GptController.requestRAG);
// router.post('/embeddings', GptController.gptEmbeddings);

router.post('/process-request', upload.single('image'), GptController.processRequest);

export default router;
