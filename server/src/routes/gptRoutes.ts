import express from 'express';
import { GptController } from '../controllers/gptController';

const router = express.Router();

router.post('/ask', GptController.ask);

export default router;
