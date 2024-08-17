import { io } from 'socket.io-client';

// TODO replace with an env variable
export const socket = io('http://localhost:8080', {
  transports: ['websocket', 'polling'],
});
