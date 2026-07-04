import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socketAuth';
import { roomManager } from './roomManager';
import prisma from '../config/db';

export const registerSocketEvents = (io: Server, socket: AuthenticatedSocket) => {
  const userId = socket.user?.id;
  if (!userId) return;

  roomManager.joinUserRoom(socket, userId);

  const joinProjectRooms = async () => {
    try {
      const memberships = await prisma.projectMember.findMany({
        where: { userId },
        select: { projectId: true }
      });
      memberships.forEach((m) => {
        roomManager.joinProjectRoom(socket, m.projectId);
      });
    } catch (err) {
      console.error('Failed to auto join project rooms:', err);
    }
  };
  joinProjectRooms();

  socket.on('joinConversation', async ({ conversationId }) => {
    try {
      const member = await prisma.conversationMember.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId
          }
        }
      });
      if (!member) {
        socket.emit('socketError', { message: 'Unauthorized room access' });
        return;
      }

      roomManager.joinConversationRoom(socket, conversationId);

      const now = new Date();
      await prisma.conversationMember.update({
        where: {
          conversationId_userId: {
            conversationId,
            userId
          }
        },
        data: {
          lastReadAt: now
        }
      });

      socket.to(`conversation:${conversationId}`).emit('readReceipt', {
        conversationId,
        userId,
        readAt: now
      });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('leaveConversation', ({ conversationId }) => {
    roomManager.leaveConversationRoom(socket, conversationId);
  });

  socket.on('typing', ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit('typing', {
      conversationId,
      userId
    });
  });

  socket.on('stopTyping', ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit('stopTyping', {
      conversationId,
      userId
    });
  });

  socket.on('readReceipt', async ({ conversationId }) => {
    try {
      const now = new Date();
      await prisma.conversationMember.update({
        where: {
          conversationId_userId: {
            conversationId,
            userId
          }
        },
        data: {
          lastReadAt: now
        }
      });
      socket.to(`conversation:${conversationId}`).emit('readReceipt', {
        conversationId,
        userId,
        readAt: now
      });
    } catch (err) {
      console.error(err);
    }
  });
};
