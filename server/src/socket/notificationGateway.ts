import { Server } from 'socket.io';
import { Notification } from '@prisma/client';

class NotificationGateway {
  private io?: Server;

  setIo(io: Server) {
    this.io = io;
  }

  sendRealTimeNotification(userId: string, notification: Notification) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('notification', {
      notification
    });
  }
}

export const notificationGateway = new NotificationGateway();
export default notificationGateway;
