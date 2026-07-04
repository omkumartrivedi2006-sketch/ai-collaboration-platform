import { FileRepository } from '../repositories/fileRepository';
import { FileVersionRepository } from '../repositories/fileVersionRepository';
import { FilePermissionRepository } from '../repositories/filePermissionRepository';
import { CloudinaryService } from './cloudinaryService';
import { PermissionService } from './permissionService';
import { FolderRepository } from '../repositories/folderRepository';
import { Role, Permission } from '@prisma/client';
import { AppError } from '../utils/AppError';
import prisma from '../config/db';
import path from 'path';

export class FileService {
  private fileRepository = new FileRepository();
  private fileVersionRepository = new FileVersionRepository();
  private filePermissionRepository = new FilePermissionRepository();
  private cloudinaryService = new CloudinaryService();
  private permissionService = new PermissionService();
  private folderRepository = new FolderRepository();

  async uploadFile(
    file: Express.Multer.File,
    folderId: string | null,
    projectId: string | null,
    taskId: string | null,
    uploadedBy: string,
    role: Role
  ) {
    let targetFolderId = folderId;

    if (taskId) {
      // 1. Find or create root 'Tasks' folder
      let tasksFolder = await this.folderRepository.findByNameInFolder('Tasks', null, projectId);
      if (!tasksFolder) {
        tasksFolder = await this.folderRepository.create({
          name: 'Tasks',
          parentId: null,
          projectId,
          createdBy: uploadedBy
        });
      }

      // 2. Find or create task folder 'Task-[ID]'
      const taskFolderTitle = `Task-${taskId.substring(0, 8)}`;
      let taskFolder = await this.folderRepository.findByNameInFolder(taskFolderTitle, tasksFolder.id, projectId);
      if (!taskFolder) {
        taskFolder = await this.folderRepository.create({
          name: taskFolderTitle,
          parentId: tasksFolder.id,
          projectId,
          createdBy: uploadedBy
        });
      }

      targetFolderId = taskFolder.id;
    }

    // 1. If folderId is provided, verify modify access on the folder
    if (targetFolderId) {
      const parentHasAccess = await this.permissionService.verifyFolderAccess(targetFolderId, uploadedBy, role, 'modify');
      if (!parentHasAccess) {
        throw new AppError('Unauthorized to upload files to this folder', 403);
      }
    }

    // 2. Validate file extension and MIME type
    const originalName = file.originalname;
    const extension = path.extname(originalName).toLowerCase().replace('.', '');
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'txt', 'csv', 'mp4', 'mov', 'avi', 'mp3', 'wav'];
    if (!allowedExtensions.includes(extension)) {
      throw new AppError(`Unsupported file extension: .${extension}`, 400);
    }

    // 3. Upload to Cloudinary (or local server folder fallback)
    const uploadResult = await this.cloudinaryService.uploadFile(file.path);

    // 4. Create the File record in PostgreSQL
    const createdFile = await this.fileRepository.create({
      name: originalName,
      originalName,
      publicId: uploadResult.publicId,
      url: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl || null,
      mimeType: file.mimetype,
      extension,
      size: file.size,
      folderId: targetFolderId || null,
      projectId: projectId || null,
      taskId: taskId || null,
      uploadedBy,
      version: 1
    });

    // 5. Create initial FileVersion record
    await this.fileVersionRepository.create({
      fileId: createdFile.id,
      version: 1,
      publicId: uploadResult.publicId,
      url: uploadResult.url,
      uploadedBy
    });

    return createdFile;
  }

  async replaceFile(
    fileId: string,
    file: Express.Multer.File,
    userId: string,
    role: Role
  ) {
    // 1. Verify user can edit the file
    const canEdit = await this.permissionService.verifyFileAccess(fileId, userId, role, Permission.EDIT);
    if (!canEdit) {
      throw new AppError('Unauthorized. You do not have permission to replace this file.', 403);
    }

    const currentFile = await this.fileRepository.findById(fileId);
    if (!currentFile) {
      throw new AppError('File not found', 404);
    }

    const originalName = file.originalname;
    const extension = path.extname(originalName).toLowerCase().replace('.', '');
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'txt', 'csv', 'mp4', 'mov', 'avi', 'mp3', 'wav'];
    if (!allowedExtensions.includes(extension)) {
      throw new AppError(`Unsupported file extension: .${extension}`, 400);
    }

    // 2. Upload to Cloudinary (or local folder)
    const uploadResult = await this.cloudinaryService.uploadFile(file.path);

    // 3. Increment version number
    const nextVersion = currentFile.version + 1;

    // 4. Update the main File record
    const updatedFile = await this.fileRepository.update(fileId, {
      name: originalName,
      originalName,
      publicId: uploadResult.publicId,
      url: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl || null,
      mimeType: file.mimetype,
      extension,
      size: file.size,
      version: nextVersion,
      uploadedBy: userId // mark this version as uploaded by the current user
    });

    // 5. Create a new FileVersion record
    await this.fileVersionRepository.create({
      fileId,
      version: nextVersion,
      publicId: uploadResult.publicId,
      url: uploadResult.url,
      uploadedBy: userId
    });

    return updatedFile;
  }

  async renameFile(fileId: string, newName: string, userId: string, role: Role) {
    const canEdit = await this.permissionService.verifyFileAccess(fileId, userId, role, Permission.EDIT);
    if (!canEdit) {
      throw new AppError('Unauthorized. You do not have permission to rename this file.', 403);
    }

    const currentFile = await this.fileRepository.findById(fileId);
    if (!currentFile) {
      throw new AppError('File not found', 404);
    }

    // Keep the current extension
    const ext = currentFile.extension;
    let nameWithExt = newName;
    if (!newName.endsWith(`.${ext}`)) {
      nameWithExt = `${newName}.${ext}`;
    }

    return this.fileRepository.update(fileId, { name: nameWithExt });
  }

  async deleteFile(fileId: string, userId: string, role: Role) {
    const currentFile = await this.fileRepository.findById(fileId);
    if (!currentFile) {
      throw new AppError('File not found', 404);
    }

    // Admins/Managers can delete project files. Employee can only delete their OWN uploaded files.
    let canDelete = false;
    if (role === Role.Admin) {
      canDelete = true;
    } else if (role === Role.Manager) {
      // If it belongs to a project, check manager permissions
      if (currentFile.projectId) {
        canDelete = true; // Managers can delete files in project files.
      } else {
        canDelete = currentFile.uploadedBy === userId;
      }
    } else {
      canDelete = currentFile.uploadedBy === userId;
    }

    if (!canDelete) {
      throw new AppError('Unauthorized. You can only delete your own uploads.', 403);
    }

    // Soft delete
    return this.fileRepository.update(fileId, { isDeleted: true });
  }

  async restoreFile(fileId: string, userId: string, role: Role) {
    const currentFile = await prisma.file.findUnique({ where: { id: fileId } });
    if (!currentFile) {
      throw new AppError('File not found', 404);
    }

    // Only creator or admin/manager can restore
    let canRestore = false;
    if (role === Role.Admin || role === Role.Manager) {
      canRestore = true;
    } else {
      canRestore = currentFile.uploadedBy === userId;
    }

    if (!canRestore) {
      throw new AppError('Unauthorized to restore this file', 403);
    }

    return this.fileRepository.update(fileId, { isDeleted: false });
  }

  async downloadFile(fileId: string, userId: string, role: Role) {
    const canDownload = await this.permissionService.verifyFileAccess(fileId, userId, role, Permission.DOWNLOAD);
    if (!canDownload) {
      throw new AppError('Unauthorized. You do not have permission to download this file.', 403);
    }

    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new AppError('File not found', 404);
    }

    const downloadUrl = await this.cloudinaryService.getSignedUrl(file.publicId);
    return {
      url: downloadUrl,
      fileName: file.originalName,
      mimeType: file.mimeType
    };
  }

  async moveFile(fileId: string, folderId: string | null, userId: string, role: Role) {
    const canEdit = await this.permissionService.verifyFileAccess(fileId, userId, role, Permission.EDIT);
    if (!canEdit) {
      throw new AppError('Unauthorized to move this file', 403);
    }

    if (folderId) {
      const folderHasAccess = await this.permissionService.verifyFolderAccess(folderId, userId, role, 'modify');
      if (!folderHasAccess) {
        throw new AppError('Unauthorized to move file to destination folder', 403);
      }
    }

    return this.fileRepository.update(fileId, { folderId: folderId || null });
  }

  async copyFile(fileId: string, folderId: string | null, userId: string, role: Role) {
    const canDownload = await this.permissionService.verifyFileAccess(fileId, userId, role, Permission.DOWNLOAD);
    if (!canDownload) {
      throw new AppError('Unauthorized to copy source file', 403);
    }

    if (folderId) {
      const folderHasAccess = await this.permissionService.verifyFolderAccess(folderId, userId, role, 'modify');
      if (!folderHasAccess) {
        throw new AppError('Unauthorized to copy file to destination folder', 403);
      }
    }

    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new AppError('File not found', 404);
    }

    // Create a duplicate record in SQL pointing to same Cloudinary publicId / url
    const copiedFile = await this.fileRepository.create({
      name: `Copy of ${file.name}`,
      originalName: file.originalName,
      publicId: file.publicId,
      url: file.url,
      thumbnailUrl: file.thumbnailUrl,
      mimeType: file.mimeType,
      extension: file.extension,
      size: file.size,
      folderId: folderId || null,
      projectId: file.projectId,
      taskId: file.taskId,
      uploadedBy: userId,
      version: 1
    });

    await this.fileVersionRepository.create({
      fileId: copiedFile.id,
      version: 1,
      publicId: file.publicId,
      url: file.url,
      uploadedBy: userId
    });

    return copiedFile;
  }

  async listFiles(filters: any, userId: string, role: Role) {
    return this.fileRepository.findAll({
      ...filters,
      userId,
      role
    });
  }

  async getStorageUsage(userId?: string) {
    return this.fileRepository.getStorageUsage(userId);
  }

  // Permission sharing
  async grantPermission(fileId: string, targetUserId: string, permission: Permission, userId: string, role: Role) {
    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new AppError('File not found', 404);
    }

    // Only file owner (uploader) or admin/manager of the project can share permissions
    let canShare = false;
    if (role === Role.Admin) {
      canShare = true;
    } else if (file.uploadedBy === userId) {
      canShare = true;
    } else if (role === Role.Manager && file.projectId) {
      // Check if project manager
      const project = await prisma.project.findUnique({ where: { id: file.projectId } });
      if (project && (project.managerId === userId || project.createdBy === userId)) {
        canShare = true;
      }
    }

    if (!canShare) {
      throw new AppError('Unauthorized. Only the file owner or manager can share this file.', 403);
    }

    return this.filePermissionRepository.upsert(fileId, targetUserId, permission);
  }

  async revokePermission(fileId: string, targetUserId: string, userId: string, role: Role) {
    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new AppError('File not found', 404);
    }

    let canRevoke = false;
    if (role === Role.Admin) {
      canRevoke = true;
    } else if (file.uploadedBy === userId) {
      canRevoke = true;
    } else if (role === Role.Manager && file.projectId) {
      const project = await prisma.project.findUnique({ where: { id: file.projectId } });
      if (project && (project.managerId === userId || project.createdBy === userId)) {
        canRevoke = true;
      }
    }

    if (!canRevoke) {
      throw new AppError('Unauthorized. Only the file owner or manager can revoke access.', 403);
    }

    return this.filePermissionRepository.delete(fileId, targetUserId);
  }

  async getPermissions(fileId: string, userId: string, role: Role) {
    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new AppError('File not found', 404);
    }

    // Verify view access first
    const hasAccess = await this.permissionService.verifyFileAccess(fileId, userId, role, Permission.VIEW);
    if (!hasAccess) {
      throw new AppError('Unauthorized to view permissions for this file', 403);
    }

    return this.filePermissionRepository.findByFileId(fileId);
  }
}
