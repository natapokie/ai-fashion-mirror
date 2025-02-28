import express from 'express';
import { GptController } from '../controllers/gptController';
import { upload } from '../multer';

const router = express.Router();

/**
 * @swagger
 * /gpt/process-request:
 *   post:
 *     tags:
 *       - gpt
 *     summary: Saves image to disk and queries OpenAI
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/FormDataRequestBody'
 *     responses:
 *       "200":
 *         description: Successfully saved image to disk and queried OpenAI
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "500":
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/process-request', upload.single('image'), GptController.processRequest);

export default router;
