import express from 'express';
import cors, { CorsOptions } from 'cors';
import path from 'path';
import fs from 'fs';
import cameraRouter from './routes/cameraRoutes';
import gptRouter from './routes/gptRoutes';
import apiRouter from './routes/apiRoutes';
import pineconeRouter from './routes/pineconeRoutes';
import { swaggerLoader } from './swagger/swagger';

// define directory to save images
const initUploadDir = (uploadDir: string = path.join(__dirname, '../__uploads')) => {
  // Check if the folder exists, and create it if it doesn't
  if (!fs.existsSync(uploadDir)) {
    console.log(`${uploadDir} does not exist! Creating folder...`);
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

initUploadDir(process.env.NODE_ENV === 'production' ? path.join('/tmp', '__uploads') : undefined);

const app = express();

const corsOptions: CorsOptions = {};

app.use(cors(corsOptions));
app.use(express.json());

// loaders
swaggerLoader(app);

// routes
app.use('/camera', cameraRouter);
app.use('/gpt', gptRouter);
app.use('/api', apiRouter);
app.use('/pinecone', pineconeRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

export { app, initUploadDir };
