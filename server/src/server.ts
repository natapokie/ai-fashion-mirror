import https from 'https';
import http from 'http';
import fs from 'fs';
import { app } from './app';
import dotenv from 'dotenv';
import path from 'path';
import { Server } from 'socket.io';
import { SocketManager } from './sockets/SocketManager';

// configure .env file to root
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

// load certificate and key from .env, if available
let server;
let httpsConnected = false;

if (process.env.NODE_ENV === 'production') {
  console.log('Starting server in production environment');
  server = http.createServer(app);
} else {
  // resolve path for docker
  const baseDir = __dirname.includes('/app') ? '/app' : __dirname;
  const keyPath = process.env.SSL_KEY_PATH
    ? path.resolve(baseDir, `../../${process.env.SSL_KEY_PATH}`)
    : null;
  const certPath = process.env.SSL_CERT_PATH
    ? path.resolve(baseDir, `../../${process.env.SSL_CERT_PATH}`)
    : null;

  if (keyPath && certPath && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    httpsConnected = true;
    const credentials = {
      key: fs.readFileSync(keyPath, 'utf8'),
      cert: fs.readFileSync(certPath, 'utf8'),
    };

    server = https.createServer(credentials, app);
    console.log('Starting server with HTTPS at: ', process.env.NEXT_PUBLIC_SERVER_BASE_URL);
  } else {
    // fallback to HTTP if no SSL credentials are provided
    server = http.createServer(app);
    console.log('SSL credentials not found, starting server with HTTP');
  }
}

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_BASE_URL,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// create socket manager
new SocketManager(io);

const PORT = (process.env.SERVER_PORT as unknown as number) || 8000;
server.listen(PORT, () => {
  const address = server.address();
  const host = typeof address === 'string' ? address : address?.address;
  const port = typeof address === 'string' ? PORT : address?.port;

  console.log(
    `Server started on ${httpsConnected ? 'HTTPS' : 'HTTP'} at ${httpsConnected ? 'https' : 'http'}://${host}:${port}`,
  );
});

export default server;
