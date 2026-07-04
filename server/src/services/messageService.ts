import { MessageRepository } from '../repositories/messageRepository';
import { ConversationRepository } from '../repositories/conversationRepository';
import { NotificationService } from './notificationService';
import { getIo } from '../socket/socketServer';
import prisma from '../config/db';
import { AppError } from '../utils/AppError';
import { MessageType } from '@prisma/client';

const messageRepo = new MessageRepository();
const conversationRepo = new ConversationRepository();
const notificationService = new NotificationService();

export class MessageService {
  async createMessage(data: {
    conversationId: string;
    senderId: string;
    message: string;
    messageType?: MessageType;
    parentMessageId?: string;
  }) {
    const conv = await conversationRepo.getById(data.conversationId);
    if (!conv) throw new AppError('Conversation not found', 404);

    const isMember = conv.members.some((m: any) => m.userId === data.senderId);
    if (!isMember) throw new AppError('Unauthorized: You are not a member of this chat room', 403);

    const senderProfile = await prisma.user.findUnique({
      where: { id: data.senderId },
      select: { name: true }
    });
    const senderName = senderProfile?.name || 'Someone';

    const msg = await messageRepo.create(data);

    // Emit live to Socket room
    try {
      const io = getIo();
      io.to(`conversation:${data.conversationId}`).emit('receiveMessage', { message: msg });
    } catch (err) {
      console.warn('Socket broadcast skipped: Server not initialized yet');
    }

    // Trigger Notification for each member
    for (const m of conv.members) {
      if (m.userId !== data.senderId) {
        await notificationService.createNotification({
          userId: m.userId,
          title: `New Message in ${conv.name || 'Direct Chat'}`,
          description: `${senderName}: ${data.message.substring(0, 60)}`,
          type: 'MESSAGE',
          actionUrl: `/chat`
        });
      }
    }

    // Scan for mentions (e.g. "@username" where username contains only word chars)
    const mentionRegex = /@(\w+)/g;
    const matches = data.message.match(mentionRegex);
    if (matches && matches.length > 0) {
      const parsedNames = matches.map(m => m.substring(1).toLowerCase());
      
      for (const m of conv.members) {
        if (m.userId !== data.senderId && m.user) {
          const userNameCompact = m.user.name.toLowerCase().replace(/\s+/g, '');
          if (parsedNames.some(name => userNameCompact.includes(name))) {
            await notificationService.createNotification({
              userId: m.userId,
              title: 'You were mentioned',
              description: `${senderName} mentioned you in a message.`,
              type: 'MESSAGE',
              actionUrl: `/chat`
            });
          }
        }
      }
    }

    return msg;
  }

  async getConversationMessages(conversationId: string, userId: string, limit: number, cursor?: string) {
    const conv = await conversationRepo.getById(conversationId);
    if (!conv) throw new AppError('Conversation not found', 404);

    const isMember = conv.members.some((m: any) => m.userId === userId);
    if (!isMember) throw new AppError('Unauthorized access to messages', 403);

    return messageRepo.getConversationMessages(conversationId, limit, cursor);
  }

  async editMessage(id: string, senderId: string, newMessage: string) {
    const msg = await messageRepo.getById(id);
    if (!msg) throw new AppError('Message not found', 404);

    if (msg.senderId !== senderId) {
      throw new AppError('Forbidden: Cannot edit someone else\'s message', 403);
    }

    const updated = await messageRepo.update(id, newMessage);

    try {
      getIo().to(`conversation:${msg.conversationId}`).emit('messageEdited', { message: updated });
    } catch (err) {
      console.error(err);
    }

    return updated;
  }

  async deleteMessage(id: string, userId: string, role: string) {
    const msg = await messageRepo.getById(id);
    if (!msg) throw new AppError('Message not found', 404);

    const isOwner = msg.senderId === userId;
    const isAdmin = role === 'Admin';

    if (!isOwner && !isAdmin) {
      throw new AppError('Forbidden: Cannot delete this message', 403);
    }

    await messageRepo.delete(id);

    try {
      getIo().to(`conversation:${msg.conversationId}`).emit('messageDeleted', {
        messageId: id,
        conversationId: msg.conversationId
      });
    } catch (err) {
      console.error(err);
    }
  }

  async addReaction(messageId: string, userId: string, emoji: string) {
    const msg = await messageRepo.getById(messageId);
    if (!msg) throw new AppError('Message not found', 404);

    const reaction = await messageRepo.addReaction(messageId, userId, emoji);

    try {
      getIo().to(`conversation:${msg.conversationId}`).emit('reactionAdded', {
        messageId,
        userId,
        emoji,
        conversationId: msg.conversationId
      });
    } catch (err) {
      console.error(err);
    }

    return reaction;
  }

  async removeReaction(messageId: string, userId: string, emoji: string) {
    const msg = await messageRepo.getById(messageId);
    if (!msg) throw new AppError('Message not found', 404);

    await messageRepo.removeReaction(messageId, userId, emoji);

    try {
      getIo().to(`conversation:${msg.conversationId}`).emit('reactionRemoved', {
        messageId,
        userId,
        emoji,
        conversationId: msg.conversationId
      });
    } catch (err) {
      console.error(err);
    }
  }

  async searchMessages(userId: string, query: string) {
    return messageRepo.search(userId, query);
  }
}
export default MessageService;
