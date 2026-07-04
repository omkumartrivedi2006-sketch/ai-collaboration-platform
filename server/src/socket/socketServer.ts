import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { socketAuthMiddleware, AuthenticatedSocket } from './socketAuth';
import { presenceService } from './presenceService';
import { registerSocketEvents } from './socketEvents';
import { notificationGateway } from './notificationGateway';

let ioInstance: Server | null = null;

export const initSocketServer = (server: HttpServer): Server => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  ioInstance = io;
  notificationGateway.setIo(io);

  io.use(socketAuthMiddleware);

  io.on('connection', async (socket: AuthenticatedSocket) => {
    const userId = socket.user?.id;
    if (!userId) return;

    const justCameOnline = await presenceService.handleConnect(userId, socket.id);
    if (justCameOnline) {
      io.emit('userOnline', { userId });
    }

    registerSocketEvents(io, socket);

    socket.on('disconnect', async () => {
      const justWentOffline = await presenceService.handleDisconnect(userId, socket.id);
      if (justWentOffline) {
        io.emit('userOffline', {
          userId,
          lastSeen: new Date()
        });
      }
    });
  });

  return io;
};

export const getIo = (): Server => {
  if (!ioInstance) {
    throw new Error('Socket.IO is not initialized!');
  }
  return ioInstance;
};
