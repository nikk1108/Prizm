import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    // Join user-specific notification room
    socket.on('join_user', (userId) => {
      socket.join(userId);
      console.log(`[Socket] Socket ${socket.id} joined user room: ${userId}`);
    });

    // Handle typing indicators
    socket.on('typing_start', ({ receiverId, senderName }) => {
      socket.to(receiverId).emit('typing_receive', { senderName });
    });

    socket.on('typing_stop', ({ receiverId }) => {
      socket.to(receiverId).emit('typing_stopped');
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};

// Helper to send real-time notification
export const sendRealTimeNotification = (recipientId, notificationData) => {
  try {
    const ioInstance = getIO();
    ioInstance.to(recipientId.toString()).emit('notification_received', notificationData);
  } catch (error) {
    console.warn(`[Socket Warning] Could not emit notification: ${error.message}`);
  }
};
