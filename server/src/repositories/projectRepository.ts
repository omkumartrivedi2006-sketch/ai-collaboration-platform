import prisma from '../config/db';
import { Prisma, Project, ProjectMember, ProjectActivity } from '@prisma/client';

export class ProjectRepository {
  async create(data: Prisma.ProjectUncheckedCreateInput): Promise<Project> {
    return prisma.project.create({ data });
  }

  async findById(id: string): Promise<any | null> {
    return prisma.project.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true, role: true, avatar: true }
        },
        manager: {
          select: { id: true, name: true, email: true, role: true, avatar: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true, avatar: true, department: true, designation: true }
            }
          }
        }
      }
    });
  }

  async findByCode(code: string): Promise<Project | null> {
    return prisma.project.findUnique({ where: { code } });
  }

  async update(id: string, data: Prisma.ProjectUncheckedUpdateInput): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Project> {
    return prisma.project.delete({
      where: { id }
    });
  }

  async findAll(params: {
    search?: string;
    status?: string;
    priority?: string;
    managerId?: string;
    isArchived?: boolean;
    skip: number;
    take: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    userId?: string;
    role?: string;
  }): Promise<{ projects: any[]; total: number }> {
    const {
      search,
      status,
      priority,
      managerId,
      isArchived = false,
      skip,
      take,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      userId,
      role
    } = params;

    const where: Prisma.ProjectWhereInput = {
      isArchived
    };

    if (role === 'Employee' && userId) {
      where.OR = [
        { managerId: userId },
        { createdBy: userId },
        {
          members: {
            some: {
              userId
            }
          }
        }
      ];
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
    }

    if (status) {
      where.status = status as any;
    }
    if (priority) {
      where.priority = priority as any;
    }
    if (managerId) {
      where.managerId = managerId;
    }

    const [projects, total] = await prisma.$transaction([
      prisma.project.findMany({
        where,
        include: {
          manager: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true }
              }
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take
      }),
      prisma.project.count({ where })
    ]);

    return { projects, total };
  }

  // Members Management
  async addMember(projectId: string, userId: string): Promise<ProjectMember> {
    return prisma.projectMember.create({
      data: {
        projectId,
        userId
      }
    });
  }

  async removeMember(projectId: string, userId: string): Promise<ProjectMember> {
    return prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      }
    });
  }

  async findMembers(projectId: string): Promise<any[]> {
    return prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, avatar: true, department: true, designation: true }
        }
      }
    });
  }

  // Activities Log Management
  async createActivity(projectId: string, userId: string, action: string): Promise<ProjectActivity> {
    return prisma.projectActivity.create({
      data: {
        projectId,
        userId,
        action
      }
    });
  }

  async findActivities(projectId: string): Promise<any[]> {
    return prisma.projectActivity.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}
