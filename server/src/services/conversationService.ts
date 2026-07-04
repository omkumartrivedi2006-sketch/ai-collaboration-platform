import { ConversationRepository } from '../repositories/conversationRepository';
import prisma from '../config/db';
import { AppError } from '../utils/AppError';

const conversationRepo = new ConversationRepository();

export class ConversationService {
  async getOrCreateDirectConversation(userA: string, userB: string) {
    if (userA === userB) throw new AppError('Cannot start chat with yourself', 400);
    
    const userBExists = await prisma.user.findUnique({ where: { id: userB } });
    if (!userBExists) throw new AppError('User not found', 404);

    return conversationRepo.createDirect([userA, userB], userA);
  }

  async getOrCreateProjectChat(projectId: string, userId: string, role: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });
    if (!project) throw new AppError('Project not found', 404);

    const isManager = project.managerId === userId || project.createdBy === userId;
    const isMember = project.members.some(m => m.userId === userId);
    const isAdmin = role === 'Admin';

    if (!isAdmin && !isManager && !isMember) {
      throw new AppError('Unauthorized: You are not a member of this project', 403);
    }

    let conv = await conversationRepo.getByProjectId(projectId);
    if (!conv) {
      const userIds = [project.managerId];
      project.members.forEach(m => {
        if (!userIds.includes(m.userId)) {
          userIds.push(m.userId);
        }
      });
      
      conv = await conversationRepo.createGroup(
        `${project.name} Chat`,
        userIds,
        project.createdBy || userId,
        projectId
      );
    }

    return conv;
  }

  async getUserConversations(userId: string) {
    const userProjects = await prisma.project.findMany({
      where: {
        OR: [
          { managerId: userId },
          { members: { some: { userId } } }
        ]
      },
      select: { id: true }
    });

    for (const p of userProjects) {
      const conv = await prisma.conversation.findUnique({ where: { projectId: p.id } });
      if (!conv) {
        try {
          const project = await prisma.project.findUnique({
            where: { id: p.id },
            include: { members: true }
          });
          if (project) {
            const uids = [project.managerId];
            project.members.forEach(m => {
              if (!uids.includes(m.userId)) uids.push(m.userId);
            });
            await conversationRepo.createGroup(
              `${project.name} Chat`,
              uids,
              project.createdBy || userId,
              p.id
            );
          }
        } catch (err) {
          console.error('Lazy init of project chat failed:', err);
        }
      }
    }

    return conversationRepo.getUserConversations(userId);
  }

  async getConversation(conversationId: string, userId: string) {
    const conv = await conversationRepo.getById(conversationId);
    if (!conv) throw new AppError('Conversation not found', 404);

    const isMember = conv.members.some((m: any) => m.userId === userId);
    if (!isMember) throw new AppError('Unauthorized access to conversation', 403);

    return conv;
  }
}
export default ConversationService;
