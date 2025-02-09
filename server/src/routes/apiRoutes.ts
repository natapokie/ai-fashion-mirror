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
 *             $ref: '#/components/schemas/FormDataRequestBody'
 *     responses:
 *       "200":
 *         description: Successfully saved image to disk and queried OpenAI.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiRequestResponse'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "500":
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/request', upload.single('image'), ApiController.process);

export default router;
