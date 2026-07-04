import { TaskRepository } from '../repositories/taskRepository';
import { ProjectRepository } from '../repositories/projectRepository';
import { UserRepository } from '../repositories/userRepository';
import { AppError } from '../utils/AppError';
import { Role, TaskStatus, TaskPriority, Task, TaskComment, TaskAttachment, TaskActivity } from '@prisma/client';
import prisma from '../config/db';

export class TaskService {
  private taskRepository: TaskRepository;
  private projectRepository: ProjectRepository;
  private userRepository: UserRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.projectRepository = new ProjectRepository();
    this.userRepository = new UserRepository();
  }

  private async verifyProjectAccess(projectId: string, userId: string, role: Role, action: 'view' | 'write' | 'delete') {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: true
      }
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (role === Role.Admin) return project;

    const isManagerOrCreator = project.managerId === userId || project.createdBy === userId;
    const isMember = project.members.some((m) => m.userId === userId);

    if (action === 'view') {
      if (!isManagerOrCreator && !isMember) {
        throw new AppError('Unauthorized. You do not belong to this project.', 403);
      }
    } else {
      // Create/Update/Delete Task
      if (role === Role.Employee) {
        throw new AppError('Employees cannot perform this task modification', 403);
      }
      if (role === Role.Manager && !isManagerOrCreator) {
        throw new AppError('Unauthorized. You can only modify tasks in projects you own or manage.', 403);
      }
    }

    return project;
  }

  private async verifyTaskAccess(task: any, userId: string, role: Role, action: 'view' | 'update_status' | 'update_all' | 'delete') {
    if (role === Role.Admin) return;

    const project = task.project;
    const isManagerOrCreator = project.managerId === userId || project.createdBy === userId;
    
    // Check if member
    const isMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: task.projectId,
          userId
        }
      }
    });

    if (action === 'view') {
      const isAssigned = task.assignedTo === userId;
      const isCreator = task.createdBy === userId;
      if (!isAssigned && !isCreator && !isManagerOrCreator && !isMember) {
        throw new AppError('Unauthorized. You do not have access to view this task.', 403);
      }
    } else if (action === 'update_status') {
      const isAssigned = task.assignedTo === userId;
      if (role === Role.Employee && !isAssigned) {
        throw new AppError('Unauthorized. Employees can only update status on tasks assigned to them.', 403);
      }
      if (role === Role.Manager && !isManagerOrCreator) {
        throw new AppError('Unauthorized. Managers can only update tasks in projects they manage.', 403);
      }
    } else if (action === 'update_all' || action === 'delete') {
      if (role === Role.Employee) {
        throw new AppError('Unauthorized. Employees do not have permission to modify task parameters.', 403);
      }
      if (role === Role.Manager && !isManagerOrCreator) {
        throw new AppError('Unauthorized. Managers can only modify tasks in projects they manage.', 403);
      }
    }
  }

  async createTask(
    data: {
      projectId: string;
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assignedTo?: string;
      estimatedHours?: number;
      startDate?: string;
      deadline?: string;
    },
    creatorId: string,
    creatorRole: Role
  ): Promise<Task> {
    const project = await this.verifyProjectAccess(data.projectId, creatorId, creatorRole, 'write');

    if (data.assignedTo) {
      const user = await this.userRepository.findById(data.assignedTo);
      if (!user) {
        throw new AppError('Assigned user not found', 404);
      }
      const isMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: data.projectId,
            userId: data.assignedTo
          }
        }
      });
      const isProjectManager = project.managerId === data.assignedTo || project.createdBy === data.assignedTo;
      if (!isMember && !isProjectManager) {
        throw new AppError('Assigned user must be a member of the project team', 400);
      }
    }

    const taskData = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      deadline: data.deadline ? new Date(data.deadline) : undefined
    };

    return this.taskRepository.create(taskData, creatorId);
  }

  async listTasks(filters: any, userId: string, role: Role) {
    return this.taskRepository.findAll(filters, userId, role);
  }

  async getTaskDetails(id: string, userId: string, role: Role) {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    await this.verifyTaskAccess(task, userId, role, 'view');
    return { task };
  }

  async updateTask(
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assignedTo?: string | null;
      estimatedHours?: number | null;
      actualHours?: number | null;
      startDate?: string | null;
      deadline?: string | null;
    },
    updaterId: string,
    updaterRole: Role
  ): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    await this.verifyTaskAccess(task, updaterId, updaterRole, 'update_all');

    if (data.assignedTo) {
      const isMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: task.projectId,
            userId: data.assignedTo
          }
        }
      });
      const isProjectManager = task.project.managerId === data.assignedTo || task.project.createdBy === data.assignedTo;
      if (!isMember && !isProjectManager) {
        throw new AppError('Assigned user must be a member of the project team', 400);
      }
    }

    const updateData: any = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : data.startDate === null ? null : undefined,
      deadline: data.deadline ? new Date(data.deadline) : data.deadline === null ? null : undefined
    };

    return this.taskRepository.update(id, updateData, updaterId);
  }

  async updateTaskStatus(id: string, status: TaskStatus, updaterId: string, updaterRole: Role): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    await this.verifyTaskAccess(task, updaterId, updaterRole, 'update_status');
    return this.taskRepository.update(id, { status }, updaterId);
  }

  async updateTaskPriority(id: string, priority: TaskPriority, updaterId: string, updaterRole: Role): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    await this.verifyTaskAccess(task, updaterId, updaterRole, 'update_all');
    return this.taskRepository.update(id, { priority }, updaterId);
  }

  async archiveTask(id: string, userId: string, role: Role): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    await this.verifyTaskAccess(task, userId, role, 'update_all');
    return prisma.$transaction(async (tx) => {
      const updated = await tx.task.update({
        where: { id },
        data: { isArchived: true }
      });
      await tx.taskActivity.create({
        data: {
          taskId: id,
          userId,
          action: 'TASK_ARCHIVED',
          newValue: 'Archived'
        }
      });
      return updated;
    });
  }

  async restoreTask(id: string, userId: string, role: Role): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    await this.verifyTaskAccess(task, userId, role, 'update_all');
    return prisma.$transaction(async (tx) => {
      const updated = await tx.task.update({
        where: { id },
        data: { isArchived: false }
      });
      await tx.taskActivity.create({
        data: {
          taskId: id,
          userId,
          action: 'TASK_RESTORED',
          newValue: 'Restored'
        }
      });
      return updated;
    });
  }

  async deleteTask(id: string, userId: string, role: Role): Promise<void> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    await this.verifyTaskAccess(task, userId, role, 'delete');
    await this.taskRepository.delete(id);
  }

  async addComment(taskId: string, comment: string, userId: string, role: Role): Promise<TaskComment> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    await this.verifyTaskAccess(task, userId, role, 'view');
    return this.taskRepository.addComment(taskId, userId, comment);
  }

  async updateComment(commentId: string, comment: string, userId: string, role: Role): Promise<TaskComment> {
    const dbComment = await this.taskRepository.findCommentById(commentId);
    if (!dbComment) {
      throw new AppError('Comment not found', 404);
    }
    if (role !== Role.Admin && dbComment.userId !== userId) {
      throw new AppError('Unauthorized. You can only update your own comments.', 403);
    }
    return this.taskRepository.updateComment(commentId, comment);
  }

  async deleteComment(commentId: string, userId: string, role: Role): Promise<void> {
    const dbComment = await this.taskRepository.findCommentById(commentId);
    if (!dbComment) {
      throw new AppError('Comment not found', 404);
    }
    if (role !== Role.Admin && dbComment.userId !== userId) {
      throw new AppError('Unauthorized. You can only delete your own comments.', 403);
    }
    await this.taskRepository.deleteComment(commentId);
  }

  async addAttachment(
    taskId: string,
    uploadedBy: string,
    fileName: string,
    fileUrl: string,
    fileType: string,
    role: Role
  ): Promise<TaskAttachment> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    await this.verifyTaskAccess(task, uploadedBy, role, 'view');
    return this.taskRepository.addAttachment(taskId, uploadedBy, fileName, fileUrl, fileType);
  }

  async deleteAttachment(attachmentId: string, userId: string, role: Role): Promise<void> {
    const attachment = await this.taskRepository.findAttachmentById(attachmentId);
    if (!attachment) {
      throw new AppError('Attachment not found', 404);
    }

    const task = await this.taskRepository.findById(attachment.taskId);
    if (role !== Role.Admin && attachment.uploadedBy !== userId) {
      // Check if project manager
      const isProjectManager = task?.project.managerId === userId || task?.project.createdBy === userId;
      if (!isProjectManager) {
        throw new AppError('Unauthorized. You can only delete attachments you uploaded.', 403);
      }
    }

    await this.taskRepository.deleteAttachment(attachmentId);
  }

  async getTaskActivities(taskId: string, userId: string, role: Role): Promise<TaskActivity[]> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    await this.verifyTaskAccess(task, userId, role, 'view');
    return this.taskRepository.findActivities(taskId);
  }
}
