import prisma from '../config/db';
import { Task, TaskStatus, TaskPriority, Role, TaskComment, TaskAttachment, TaskActivity } from '@prisma/client';

export class TaskRepository {
  async create(
    data: {
      projectId: string;
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assignedTo?: string;
      estimatedHours?: number;
      startDate?: Date;
      deadline?: Date;
    },
    creatorId: string
  ): Promise<Task> {
    return prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          projectId: data.projectId,
          title: data.title,
          description: data.description,
          status: data.status || TaskStatus.TODO,
          priority: data.priority || TaskPriority.MEDIUM,
          assignedTo: data.assignedTo || null,
          estimatedHours: data.estimatedHours || null,
          startDate: data.startDate || null,
          deadline: data.deadline || null,
          createdBy: creatorId
        }
      });

      await tx.taskActivity.create({
        data: {
          taskId: task.id,
          userId: creatorId,
          action: 'TASK_CREATED',
          newValue: task.title
        }
      });

      return task;
    });
  }

  async findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
            managerId: true,
            createdBy: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true
          }
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });
  }

  async findAll(
    filters: {
      projectId?: string;
      assignedTo?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      search?: string;
      isArchived?: boolean | string;
      page?: number | string;
      limit?: number | string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    userId: string,
    role: Role
  ): Promise<{ tasks: any[]; total: number }> {
    const isArchived = filters.isArchived === 'true' || filters.isArchived === true;
    const page = parseInt(filters.page as string) || 1;
    const limit = parseInt(filters.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      isArchived
    };

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }
    if (filters.assignedTo) {
      where.assignedTo = filters.assignedTo;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.priority) {
      where.priority = filters.priority;
    }
    if (filters.search) {
      where.title = {
        contains: filters.search,
        mode: 'insensitive'
      };
    }

    // Role-based visibility scoping
    if (role === Role.Employee) {
      where.OR = [
        { assignedTo: userId },
        { createdBy: userId },
        {
          project: {
            members: {
              some: { userId }
            }
          }
        }
      ];
    } else if (role === Role.Manager) {
      where.OR = [
        { createdBy: userId },
        { assignedTo: userId },
        {
          project: {
            OR: [
              { managerId: userId },
              { createdBy: userId },
              {
                members: {
                  some: { userId }
                }
              }
            ]
          }
        }
      ];
    }

    const sortField = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    const orderBy: any = {};
    if (sortField === 'alphabetical') {
      orderBy.title = 'asc';
    } else {
      orderBy[sortField] = sortOrder;
    }

    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          assignee: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      }),
      prisma.task.count({ where })
    ]);

    return { tasks, total };
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assignedTo?: string | null;
      estimatedHours?: number | null;
      actualHours?: number | null;
      startDate?: Date | null;
      deadline?: Date | null;
    },
    updaterId: string
  ): Promise<Task> {
    return prisma.$transaction(async (tx) => {
      const oldTask = await tx.task.findUnique({
        where: { id }
      });

      if (!oldTask) {
        throw new Error('Task not found');
      }

      // Check fields for changes and record activities
      const activitiesToLog: any[] = [];
      const updateData: any = { ...data };

      if (data.status !== undefined && data.status !== oldTask.status) {
        activitiesToLog.push({
          action: 'STATUS_CHANGED',
          oldValue: oldTask.status,
          newValue: data.status
        });

        if (data.status === TaskStatus.COMPLETED) {
          updateData.completedAt = new Date();
          activitiesToLog.push({
            action: 'TASK_COMPLETED',
            newValue: 'Completed'
          });
        } else if (oldTask.status === TaskStatus.COMPLETED) {
          updateData.completedAt = null;
        }
      }

      if (data.priority !== undefined && data.priority !== oldTask.priority) {
        activitiesToLog.push({
          action: 'PRIORITY_CHANGED',
          oldValue: oldTask.priority,
          newValue: data.priority
        });
      }

      if (data.assignedTo !== undefined && data.assignedTo !== oldTask.assignedTo) {
        activitiesToLog.push({
          action: 'ASSIGNMENT_CHANGED',
          oldValue: oldTask.assignedTo || 'Unassigned',
          newValue: data.assignedTo || 'Unassigned'
        });
      }

      // general log
      if (activitiesToLog.length === 0) {
        activitiesToLog.push({
          action: 'TASK_UPDATED',
          newValue: 'Details updated'
        });
      }

      const updatedTask = await tx.task.update({
        where: { id },
        data: updateData
      });

      for (const act of activitiesToLog) {
        await tx.taskActivity.create({
          data: {
            taskId: id,
            userId: updaterId,
            action: act.action,
            oldValue: act.oldValue,
            newValue: act.newValue
          }
        });
      }

      return updatedTask;
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.task.delete({
      where: { id }
    });
  }

  async addComment(taskId: string, userId: string, comment: string): Promise<TaskComment> {
    return prisma.$transaction(async (tx) => {
      const commentObj = await tx.taskComment.create({
        data: {
          taskId,
          userId,
          comment
        }
      });

      await tx.taskActivity.create({
        data: {
          taskId,
          userId,
          action: 'COMMENT_ADDED',
          newValue: 'Added a comment'
        }
      });

      return commentObj;
    });
  }

  async updateComment(id: string, comment: string): Promise<TaskComment> {
    return prisma.taskComment.update({
      where: { id },
      data: { comment }
    });
  }

  async deleteComment(id: string): Promise<void> {
    await prisma.taskComment.delete({
      where: { id }
    });
  }

  async addAttachment(
    taskId: string,
    uploadedBy: string,
    fileName: string,
    fileUrl: string,
    fileType: string
  ): Promise<TaskAttachment> {
    return prisma.$transaction(async (tx) => {
      const attachment = await tx.taskAttachment.create({
        data: {
          taskId,
          fileName,
          fileUrl,
          fileType,
          uploadedBy
        }
      });

      await tx.taskActivity.create({
        data: {
          taskId,
          userId: uploadedBy,
          action: 'ATTACHMENT_UPLOADED',
          newValue: fileName
        }
      });

      return attachment;
    });
  }

  async deleteAttachment(id: string): Promise<void> {
    await prisma.taskAttachment.delete({
      where: { id }
    });
  }

  async findCommentById(id: string): Promise<TaskComment | null> {
    return prisma.taskComment.findUnique({ where: { id } });
  }

  async findAttachmentById(id: string): Promise<TaskAttachment | null> {
    return prisma.taskAttachment.findUnique({ where: { id } });
  }

  async findActivities(taskId: string): Promise<TaskActivity[]> {
    return prisma.taskActivity.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
