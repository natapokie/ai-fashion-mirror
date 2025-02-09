import express from 'express';
import { ApiController } from '../controllers/apiController';
import { upload } from '../multer';

const router = express.Router();

/**
 * @swagger
 * /api/request:
 *   post:
 *     deprecated: true
 *     tags:
 *       - api
 *     summary: Saves image to disk, queries OpenAI, and returns a list of recommended products, including image, name, and feedback on why the product is suitable.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ApiRequestBody'
 *     responses:
 *       "200":
 *         description: Successfully saved image to disk and queried OpenAI.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiRequestResponse'
 *       "400":
 *         description: Error processing request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "500":
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/request', upload.single('image'), ApiController.process);

export default router;
