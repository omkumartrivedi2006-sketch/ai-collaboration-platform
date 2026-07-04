import prisma from '../config/db';
import { Conversation, ConversationType } from '@prisma/client';

export class ConversationRepository {
  async findDirectConversation(userIds: string[]): Promise<any | null> {
    if (userIds.length !== 2) return null;
    
    // Find conversation of type DIRECT containing exactly both members
    const conversations = await prisma.conversation.findMany({
      where: {
        type: 'DIRECT',
        AND: [
          { members: { some: { userId: userIds[0] } } },
          { members: { some: { userId: userIds[1] } } }
        ]
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true, avatar: true, isOnline: true, lastSeen: true }
            }
          }
        }
      }
    });

    // Verify it doesn't contain a third member (in case of schema edge cases)
    const matched = conversations.find(c => c.members.length === 2);
    return matched || null;
  }

  async createDirect(userIds: string[], createdBy: string): Promise<any> {
    const existing = await this.findDirectConversation(userIds);
    if (existing) return existing;

    return prisma.conversation.create({
      data: {
        type: 'DIRECT',
        createdBy,
        members: {
          create: userIds.map(uid => ({ userId: uid }))
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true, avatar: true, isOnline: true, lastSeen: true }
            }
          }
        }
      }
    });
  }

  async createGroup(name: string, userIds: string[], createdBy: string, projectId?: string): Promise<any> {
    return prisma.conversation.create({
      data: {
        type: 'GROUP',
        name,
        projectId,
        createdBy,
        members: {
          create: userIds.map(uid => ({ userId: uid }))
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true, avatar: true, isOnline: true, lastSeen: true }
            }
          }
        },
        project: true
      }
    });
  }

  async getUserConversations(userId: string): Promise<any[]> {
    return prisma.conversation.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: {
        project: true,
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true, avatar: true, isOnline: true, lastSeen: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { id: true, name: true, avatar: true }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getById(id: string): Promise<any | null> {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        project: true,
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true, avatar: true, isOnline: true, lastSeen: true }
            }
          }
        }
      }
    });
  }

  async getByProjectId(projectId: string): Promise<any | null> {
    return prisma.conversation.findUnique({
      where: { projectId },
      include: {
        project: true,
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true, avatar: true, isOnline: true, lastSeen: true }
            }
          }
        }
      }
    });
  }

  async addMember(conversationId: string, userId: string): Promise<void> {
    await prisma.conversationMember.create({
      data: {
        conversationId,
        userId
      }
    });
  }

  async removeMember(conversationId: string, userId: string): Promise<void> {
    await prisma.conversationMember.delete({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      }
    });
  }

  async updateLastRead(conversationId: string, userId: string): Promise<void> {
    await prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      },
      data: {
        lastReadAt: new Date()
      }
    });
  }
}
export default ConversationRepository;
