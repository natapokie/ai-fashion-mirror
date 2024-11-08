import https from 'https'; // import https, set up certificate (for windows as well)
import fs from 'fs';
import app from './app';
import dotenv from 'dotenv';
import path from 'path';
import { Server } from 'socket.io';
import { SocketManager } from './sockets/SocketManager';

// configure .env file to root
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

// load certificate and key from environment variables
const credentials = {
  key: fs.readFileSync(path.resolve(__dirname, '../../', process.env.SSL_KEY_PATH!), 'utf8'),
  cert: fs.readFileSync(path.resolve(__dirname, '../../', process.env.SSL_CERT_PATH!), 'utf8'),
};

const server = https.createServer(credentials, app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_BASE_URL,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// create socket manager
new SocketManager(io);

server.listen(process.env.SERVER_PORT || 8080, () => {
  console.log(`Server started on HTTPS port: ${process.env.SERVER_PORT}`);
});