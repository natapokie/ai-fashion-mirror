import express from 'express';
import cors, { CorsOptions } from 'cors';
import path from 'path';

const app = express();

const corsOptions: CorsOptions = {};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

export default app;
