import { useEffect } from 'react';
import { initiateSocket, disconnectSocket, getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';

export const useSocket = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      initiateSocket(user.id || user._id);
    }

    return () => {
      disconnectSocket();
    };
  }, [user]);

  const emit = (event: string, data: any) => {
    const socket = getSocket();
    if (socket) {
      socket.emit(event, data);
    }
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    const socket = getSocket();
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event: string) => {
    const socket = getSocket();
    if (socket) {
      socket.off(event);
    }
  };

  return { emit, on, off, isConnected: !!getSocket()?.connected };
};
export default useSocket;
