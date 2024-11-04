import express from 'express';
import cors, { CorsOptions } from 'cors';
import path from 'path';
import cameraRouter from './routes/cameraRoutes';

const app = express();

const corsOptions: CorsOptions = {};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use('/camera', cameraRouter);

export default app;
