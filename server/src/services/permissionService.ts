import { Role, Permission } from '@prisma/client';
import prisma from '../config/db';
import { AppError } from '../utils/AppError';

export class PermissionService {
  async verifyFileAccess(
    fileId: string,
    userId: string,
    role: Role,
    requiredPermission: Permission
  ): Promise<boolean> {
    if (role === Role.Admin) {
      return true;
    }

    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        permissions: true,
        project: {
          include: {
            members: true
          }
        }
      }
    });

    if (!file) {
      throw new AppError('File not found', 404);
    }

    if (file.isDeleted) {
      throw new AppError('File is deleted', 404);
    }

    // Owner check: uploader always has full access
    if (file.uploadedBy === userId) {
      return true;
    }

    // Explicit file permission check
    const userPermission = file.permissions.find((p) => p.userId === userId);
    if (userPermission) {
      const permissionWeight = {
        [Permission.OWNER]: 4,
        [Permission.EDIT]: 3,
        [Permission.DOWNLOAD]: 2,
        [Permission.VIEW]: 1
      };

      const hasRequired =
        permissionWeight[userPermission.permission] >= permissionWeight[requiredPermission];
      if (hasRequired) {
        return true;
      }
    }

    // Project manager check
    if (file.projectId) {
      const project = file.project;
      if (project) {
        const isManagerOrCreator = project.managerId === userId || project.createdBy === userId;
        if (isManagerOrCreator && role === Role.Manager) {
          return true;
        }

        // Project members default permissions
        const isMember = project.members.some((m) => m.userId === userId);
        if (isMember) {
          // Managers who are members get EDIT/OWNER, Employees get VIEW/DOWNLOAD by default
          if (role === Role.Manager) {
            return true;
          }
          if (role === Role.Employee) {
            // Employee can only VIEW and DOWNLOAD by default
            if (requiredPermission === Permission.VIEW || requiredPermission === Permission.DOWNLOAD) {
              return true;
            }
          }
        }
      }
    }

    // Task assignee/creator check
    if (file.taskId) {
      const task = await prisma.task.findUnique({
        where: { id: file.taskId },
        include: {
          project: {
            include: {
              members: true
            }
          }
        }
      });
      if (task) {
        const isAssigned = task.assignedTo === userId;
        const isCreator = task.createdBy === userId;
        if (isAssigned || isCreator) {
          if (requiredPermission === Permission.VIEW || requiredPermission === Permission.DOWNLOAD) {
            return true;
          }
        }
      }
    }

    return false;
  }

  async verifyFolderAccess(
    folderId: string,
    userId: string,
    role: Role,
    requiredAction: 'view' | 'modify'
  ): Promise<boolean> {
    if (role === Role.Admin) {
      return true;
    }

    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        project: {
          include: {
            members: true
          }
        }
      }
    });

    if (!folder) {
      throw new AppError('Folder not found', 404);
    }

    // Owner check
    if (folder.createdBy === userId) {
      return true;
    }

    if (folder.projectId) {
      const project = folder.project;
      if (project) {
        const isManagerOrCreator = project.managerId === userId || project.createdBy === userId;
        if (isManagerOrCreator && role === Role.Manager) {
          return true;
        }

        const isMember = project.members.some((m) => m.userId === userId);
        if (isMember) {
          if (requiredAction === 'view') {
            return true;
          }
          // Only Manager of the project or Folder Creator can modify folders in the project
          if (requiredAction === 'modify' && role === Role.Manager) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
