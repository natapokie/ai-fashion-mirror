import express from 'express';
import { CameraController } from '../controllers/cameraController';
import { upload } from '../multer';

const router = express.Router();

// uploaded file is located in the "file" field of the formData obj
/**
 * @swagger
 * /camera/save:
 *   post:
 *     tags:
 *       - camera
 *     summary: Saves image to disk
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/FormDataRequestBody'
 *     responses:
 *       "200":
 *         description: Successfully saved image to disk
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "500":
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/save', upload.single('image'), CameraController.saveImage);

export default router;
