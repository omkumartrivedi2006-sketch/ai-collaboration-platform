import prisma from '../config/db';
import { Message, MessageType } from '@prisma/client';

export class MessageRepository {
  async create(data: {
    conversationId: string;
    senderId: string;
    message: string;
    messageType?: MessageType;
    parentMessageId?: string;
  }): Promise<any> {
    return prisma.$transaction(async (tx) => {
      // 1. Create message
      const msg = await tx.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          message: data.message,
          messageType: data.messageType || 'TEXT',
          parentMessageId: data.parentMessageId
        },
        include: {
          sender: {
            select: { id: true, name: true, avatar: true }
          },
          reactions: {
            include: {
              user: { select: { id: true, name: true } }
            }
          },
          parentMessage: {
            include: {
              sender: { select: { id: true, name: true } }
            }
          }
        }
      });

      // 2. Update conversation's updatedAt timestamp to float it to the top of list
      await tx.conversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() }
      });

      return msg;
    });
  }

  async getById(id: string): Promise<any | null> {
    return prisma.message.findUnique({
      where: { id },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        },
        reactions: {
          include: {
            user: { select: { id: true, name: true } }
          }
        },
        conversation: {
          select: { id: true, type: true, projectId: true }
        },
        parentMessage: {
          include: {
            sender: { select: { id: true, name: true } }
          }
        }
      }
    });
  }

  async getConversationMessages(conversationId: string, limit: number, cursor?: string): Promise<any[]> {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        },
        reactions: {
          include: {
            user: { select: { id: true, name: true } }
          }
        },
        parentMessage: {
          include: {
            sender: { select: { id: true, name: true } }
          }
        }
      }
    });
  }

  async update(id: string, message: string): Promise<any> {
    return prisma.message.update({
      where: { id },
      data: {
        message,
        edited: true,
        editedAt: new Date()
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        },
        reactions: {
          include: {
            user: { select: { id: true, name: true } }
          }
        },
        parentMessage: {
          include: {
            sender: { select: { id: true, name: true } }
          }
        }
      }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.message.delete({
      where: { id }
    });
  }

  async addReaction(messageId: string, userId: string, emoji: string): Promise<any> {
    return prisma.messageReaction.upsert({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji
        }
      },
      create: {
        messageId,
        userId,
        emoji
      },
      update: {}
    });
  }

  async removeReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    await prisma.messageReaction.delete({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji
        }
      }
    });
  }

  async search(userId: string, query: string): Promise<any[]> {
    return prisma.message.findMany({
      where: {
        message: { contains: query, mode: 'insensitive' },
        conversation: {
          members: {
            some: { userId }
          }
        }
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        },
        conversation: {
          select: { id: true, name: true, type: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }
}
export default MessageRepository;
