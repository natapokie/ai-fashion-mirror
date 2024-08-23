import http from 'http';
import app from './app';
import dotenv from 'dotenv';
import path from 'path';
import { Server } from 'socket.io';
import { SocketManager } from './sockets/SocketManager';

// configure .env file to root
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_BASE_URL,
  },
  transports: ['websocket', 'polling'],
});

// create socket manager
new SocketManager(io);

server.listen(process.env.SERVER_PORT || 8080, () => {
  console.log(`Server started on port: ${process.env.SERVER_PORT}`);
});
