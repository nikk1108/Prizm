import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initiateSocket = (userId: string): Socket => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
  
  if (!socket) {
    socket = io(socketUrl, {
      withCredentials: true,
      autoConnect: true
    });
    
    socket.on('connect', () => {
      console.log('[Socket] Connected to server');
      socket?.emit('join_user', userId);
    });
  } else if (!socket.connected) {
    socket.connect();
    socket.emit('join_user', userId);
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[Socket] Disconnected from server');
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};
