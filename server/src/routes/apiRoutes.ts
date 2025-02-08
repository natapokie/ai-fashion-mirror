import express from 'express';
import { ApiController } from '../controllers/apiController';
import { upload } from '../multer';

const router = express.Router();

/**
 * @swagger:
 * /api/request:
 *   post:
 *     summary: Saves image to disk
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ApiRequest'
 *     responses:
 *       '200':
 *         description: Successfully saved image to disk
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/request', upload.single('image'), ApiController.process);

export default router;
