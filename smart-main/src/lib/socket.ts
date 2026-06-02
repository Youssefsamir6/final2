// Minimal utils - main logic in SocketProvider
import { io } from 'socket.io-client';

export const initSocket = () => {
  return io('/api/socket', {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });
};

export type SocketEvent = 'liveLog' | 'newAlert' | 'unreadCount';
