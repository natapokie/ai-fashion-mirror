import { io } from 'socket.io-client';

// TODO replace with an env variable
export const socket = io(`${process.env.SERVER_BASE_URL}`, {
  transports: ['websocket', 'polling'],
});
