import { FolderRepository } from '../repositories/folderRepository';
import { FileRepository } from '../repositories/fileRepository';
import { PermissionService } from './permissionService';
import { Role } from '@prisma/client';
import { AppError } from '../utils/AppError';

export class FolderService {
  private folderRepository = new FolderRepository();
  private fileRepository = new FileRepository();
  private permissionService = new PermissionService();

  async createFolder(
    name: string,
    parentId: string | null,
    projectId: string | null,
    userId: string,
    role: Role
  ) {
    if (parentId) {
      const parentHasAccess = await this.permissionService.verifyFolderAccess(parentId, userId, role, 'modify');
      if (!parentHasAccess) {
        throw new AppError('Unauthorized to create folder here', 403);
      }
    }

    const existing = await this.folderRepository.findByNameInFolder(name, parentId, projectId);
    if (existing) {
      throw new AppError('Folder with this name already exists in this directory', 400);
    }

    return this.folderRepository.create({
      name,
      parentId: parentId || null,
      projectId: projectId || null,
      createdBy: userId
    });
  }

  async renameFolder(id: string, name: string, userId: string, role: Role) {
    const hasAccess = await this.permissionService.verifyFolderAccess(id, userId, role, 'modify');
    if (!hasAccess) {
      throw new AppError('Unauthorized to rename this folder', 403);
    }

    const folder = await this.folderRepository.findById(id);
    if (!folder) {
      throw new AppError('Folder not found', 404);
    }

    const existing = await this.folderRepository.findByNameInFolder(name, folder.parentId, folder.projectId);
    if (existing && existing.id !== id) {
      throw new AppError('Folder with this name already exists in this directory', 400);
    }

    return this.folderRepository.update(id, { name });
  }

  async deleteFolder(id: string, userId: string, role: Role) {
    const hasAccess = await this.permissionService.verifyFolderAccess(id, userId, role, 'modify');
    if (!hasAccess) {
      throw new AppError('Unauthorized to delete this folder', 403);
    }

    // Cascade is handled by PostgreSQL onDelete: Cascade in Prisma schema.
    return this.folderRepository.delete(id);
  }

  async getFolderContents(
    folderId: string | null,
    projectId: string | null,
    userId: string,
    role: Role
  ) {
    if (folderId) {
      const hasAccess = await this.permissionService.verifyFolderAccess(folderId, userId, role, 'view');
      if (!hasAccess) {
        throw new AppError('Unauthorized to view this folder', 403);
      }
    }

    // Get subfolders
    const folders = await this.folderRepository.findSubfolders(folderId, projectId);

    // Get files in folder
    const filesData = await this.fileRepository.findAll({
      folderId,
      projectId,
      isDeleted: false,
      skip: 0,
      take: 1000,
      userId,
      role
    });

    return {
      folders,
      files: filesData.files
    };
  }

  async getFolderTree(projectId: string | null, userId: string, role: Role) {
    // Return all folders for project (if any) or user-owned folders
    const allFolders = await this.folderRepository.findFolderTree(projectId);
    
    // Filter folders that the user has access to view
    const visibleFolders = [];
    for (const f of allFolders) {
      const hasAccess = await this.permissionService.verifyFolderAccess(f.id, userId, role, 'view');
      if (hasAccess) {
        visibleFolders.push(f);
      }
    }

    return visibleFolders;
  }
}
