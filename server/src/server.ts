import http from 'http';
import app from './app';
import { Server } from 'socket.io';
import { SocketManager } from './sockets/SocketManager';

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
  },
  transports: ['websocket', 'polling'],
});

// create socket manager
new SocketManager(io);

server.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
