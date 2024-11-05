import express from 'express';
import cors, { CorsOptions } from 'cors';
import path from 'path';
import fs from 'fs';
import cameraRouter from './routes/cameraRoutes';

// define directory to save images
const uploadDir = path.join(__dirname, '../__uploads');

// Check if the folder exists, and create it if it doesn't
if (!fs.existsSync(uploadDir)) {
  console.log(`${uploadDir} does not exist! Creating folder...`);
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();

const corsOptions: CorsOptions = {};

app.use(cors(corsOptions));
app.use(express.json());

// routes
app.use('/camera', cameraRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

export default app;
