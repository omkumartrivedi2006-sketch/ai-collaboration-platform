import { ProjectRepository } from '../repositories/projectRepository';
import { UserRepository } from '../repositories/userRepository';
import { AppError } from '../utils/AppError';
import { Project, ProjectStatus, ProjectPriority, Role } from '@prisma/client';

export class ProjectService {
  private projectRepository: ProjectRepository;
  private userRepository: UserRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
    this.userRepository = new UserRepository();
  }

  private async verifyUserExists(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  private checkProjectPermission(project: any, userId: string, userRole: Role, action: 'edit' | 'delete' | 'manage_members') {
    if (userRole === 'Admin') return; 

    if (userRole === 'Employee') {
      throw new AppError('Employees do not have permission to modify projects', 403);
    }

    if (userRole === 'Manager') {
      if (action === 'delete') {
        throw new AppError('Only system administrators can delete projects', 403);
      }
      const isAuthorized = project.managerId === userId || project.createdBy === userId;
      if (!isAuthorized) {
        throw new AppError('Unauthorized. You can only manage projects you own or manage.', 403);
      }
    }
  }

  async createProject(
    data: {
      name: string;
      code: string;
      description?: string;
      status?: ProjectStatus;
      priority?: ProjectPriority;
      startDate?: string;
      deadline?: string;
      managerId: string;
      members?: string[];
    },
    createdByUserId: string,
    creatorRole: Role
  ): Promise<Project> {
    if (creatorRole === 'Employee') {
      throw new AppError('Employees are not authorized to create projects', 403);
    }

    const existing = await this.projectRepository.findByCode(data.code);
    if (existing) {
      throw new AppError(`Project code "${data.code}" is already in use`, 400);
    }

    await this.verifyUserExists(data.managerId);

    const project = await this.projectRepository.create({
      name: data.name,
      code: data.code,
      description: data.description,
      status: data.status,
      priority: data.priority,
      startDate: data.startDate ? new Date(data.startDate) : null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      createdBy: createdByUserId,
      managerId: data.managerId
    });

    await this.projectRepository.createActivity(project.id, createdByUserId, 'Project Created');
    await this.projectRepository.addMember(project.id, data.managerId);

    if (data.members && Array.isArray(data.members)) {
      for (const mId of data.members) {
        if (mId !== data.managerId) {
          try {
            await this.projectRepository.addMember(project.id, mId);
          } catch (err) {
            console.error(`Failed to add member ${mId} to new project:`, err);
          }
        }
      }
    }

    return project;
  }

  async getProjectDetails(id: string, userId: string, userRole: Role): Promise<any> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (userRole === 'Employee') {
      const isMember = project.members.some((m: any) => m.userId === userId);
      const isManager = project.managerId === userId;
      const isCreator = project.createdBy === userId;
      if (!isMember && !isManager && !isCreator) {
        throw new AppError('Unauthorized access to this project', 403);
      }
    }

    return project;
  }

  async updateProject(
    id: string,
    data: {
      name?: string;
      description?: string;
      status?: ProjectStatus;
      priority?: ProjectPriority;
      startDate?: string;
      deadline?: string;
    },
    userId: string,
    userRole: Role
  ): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    this.checkProjectPermission(project, userId, userRole, 'edit');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.deadline !== undefined) updateData.deadline = data.deadline ? new Date(data.deadline) : null;

    const updated = await this.projectRepository.update(id, updateData);

    let actions: string[] = [];
    if (data.status && data.status !== project.status) actions.push(`Status changed to ${data.status}`);
    if (data.deadline && data.deadline !== project.deadline?.toISOString()) actions.push('Deadline Updated');

    const logMsg = actions.length > 0 ? actions.join(', ') : 'Project Details Updated';
    await this.projectRepository.createActivity(id, userId, logMsg);

    return updated;
  }

  async deleteProject(id: string, userId: string, userRole: Role): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    this.checkProjectPermission(project, userId, userRole, 'delete');

    return this.projectRepository.delete(id);
  }

  async archiveProject(id: string, userId: string, userRole: Role): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    this.checkProjectPermission(project, userId, userRole, 'edit');

    const updated = await this.projectRepository.update(id, { isArchived: true });
    await this.projectRepository.createActivity(id, userId, 'Project Archived');

    return updated;
  }

  async restoreProject(id: string, userId: string, userRole: Role): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    this.checkProjectPermission(project, userId, userRole, 'edit');

    const updated = await this.projectRepository.update(id, { isArchived: false });
    await this.projectRepository.createActivity(id, userId, 'Project Restored');

    return updated;
  }

  async listProjects(
    params: {
      search?: string;
      status?: string;
      priority?: string;
      managerId?: string;
      isArchived?: boolean;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    userId: string,
    userRole: Role
  ): Promise<{ projects: any[]; total: number; page: number; limit: number }> {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const result = await this.projectRepository.findAll({
      search: params.search,
      status: params.status,
      priority: params.priority,
      managerId: params.managerId,
      isArchived: params.isArchived,
      skip,
      take: limit,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      userId,
      role: userRole
    });

    return {
      projects: result.projects,
      total: result.total,
      page,
      limit
    };
  }

  async addProjectMember(projectId: string, targetUserId: string, actionByUserId: string, actionByUserRole: Role) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    this.checkProjectPermission(project, actionByUserId, actionByUserRole, 'manage_members');
    await this.verifyUserExists(targetUserId);

    const isAlreadyMember = project.members.some((m: any) => m.userId === targetUserId);
    if (isAlreadyMember) {
      throw new AppError('User is already a member of this project', 400);
    }

    const member = await this.projectRepository.addMember(projectId, targetUserId);
    await this.projectRepository.createActivity(projectId, actionByUserId, 'Member Added');

    return member;
  }

  async removeProjectMember(projectId: string, targetUserId: string, actionByUserId: string, actionByUserRole: Role) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    this.checkProjectPermission(project, actionByUserId, actionByUserRole, 'manage_members');

    if (project.managerId === targetUserId) {
      throw new AppError('Cannot remove the project manager. Transfer manager responsibilities first.', 400);
    }

    const member = await this.projectRepository.removeMember(projectId, targetUserId);
    await this.projectRepository.createActivity(projectId, actionByUserId, 'Member Removed');

    return member;
  }

  async getProjectMembers(projectId: string, userId: string, userRole: Role) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (userRole === 'Employee') {
      const isMember = project.members.some((m: any) => m.userId === userId);
      if (!isMember && project.managerId !== userId && project.createdBy !== userId) {
        throw new AppError('Unauthorized', 403);
      }
    }

    return this.projectRepository.findMembers(projectId);
  }

  async changeProjectManager(projectId: string, newManagerId: string, actionByUserId: string, actionByUserRole: Role) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (actionByUserRole !== 'Admin') {
      throw new AppError('Only administrators can change project managers', 403);
    }

    const newManager = await this.verifyUserExists(newManagerId);
    if (newManager.role !== 'Admin' && newManager.role !== 'Manager') {
      throw new AppError('Project managers must have Admin or Manager roles', 400);
    }

    const updated = await this.projectRepository.update(projectId, { managerId: newManagerId });

    const isMember = project.members.some((m: any) => m.userId === newManagerId);
    if (!isMember) {
      await this.projectRepository.addMember(projectId, newManagerId);
    }

    await this.projectRepository.createActivity(projectId, actionByUserId, 'Manager Changed');

    return updated;
  }

  async getProjectActivities(projectId: string, userId: string, userRole: Role) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (userRole === 'Employee') {
      const isMember = project.members.some((m: any) => m.userId === userId);
      if (!isMember && project.managerId !== userId && project.createdBy !== userId) {
        throw new AppError('Unauthorized', 403);
      }
    }

    return this.projectRepository.findActivities(projectId);
  }
}
