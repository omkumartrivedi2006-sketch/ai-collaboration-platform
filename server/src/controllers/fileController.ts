import { Request, Response, NextFunction } from 'express';
import { FileService } from '../services/fileService';
import { VersionService } from '../services/versionService';
import { Role, Permission } from '@prisma/client';
import { AppError } from '../utils/AppError';
import path from 'path';

const fileService = new FileService();
const versionService = new VersionService();

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const { folderId, projectId, taskId } = req.body;

    const file = await fileService.uploadFile(
      req.file,
      folderId || null,
      projectId || null,
      taskId || null,
      userId,
      role
    );

    res.status(201).json({
      status: 'success',
      data: { file }
    });
  } catch (error) {
    next(error);
  }
};

export const replaceFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { id } = req.params;

    if (!req.file) {
      throw new AppError('No replacement file uploaded', 400);
    }

    const file = await fileService.replaceFile(id, req.file, userId, role);

    res.status(200).json({
      status: 'success',
      data: { file }
    });
  } catch (error) {
    next(error);
  }
};

export const renameFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      throw new AppError('File name is required', 400);
    }

    const file = await fileService.renameFile(id, name, userId, role);

    res.status(200).json({
      status: 'success',
      data: { file }
    });
  } catch (error) {
    next(error);
  }
};

export const moveFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { id } = req.params;
    const { folderId } = req.body;

    const file = await fileService.moveFile(id, folderId || null, userId, role);

    res.status(200).json({
      status: 'success',
      data: { file }
    });
  } catch (error) {
    next(error);
  }
};

export const copyFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { id } = req.params;
    const { folderId } = req.body;

    const file = await fileService.copyFile(id, folderId || null, userId, role);

    res.status(200).json({
      status: 'success',
      data: { file }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { id } = req.params;

    await fileService.deleteFile(id, userId, role);

    res.status(200).json({
      status: 'success',
      message: 'File moved to trash'
    });
  } catch (error) {
    next(error);
  }
};

export const restoreFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { id } = req.params;

    const file = await fileService.restoreFile(id, userId, role);

    res.status(200).json({
      status: 'success',
      data: { file }
    });
  } catch (error) {
    next(error);
  }
};

export const downloadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { id } = req.params;

    const downloadData = await fileService.downloadFile(id, userId, role);

    if (downloadData.url.startsWith('/uploads')) {
      const localPath = path.join(__dirname, '../../../', downloadData.url);
      return res.download(localPath, downloadData.fileName);
    } else {
      return res.redirect(downloadData.url);
    }
  } catch (error) {
    next(error);
  }
};

export const getVersions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { id } = req.params;

    // Verify view access first
    const canView = await fileService.downloadFile(id, userId, role); // Reuse check
    if (!canView) {
      throw new AppError('Unauthorized', 403);
    }

    const versions = await versionService.getVersionHistory(id);

    res.status(200).json({
      status: 'success',
      data: { versions }
    });
  } catch (error) {
    next(error);
  }
};

export const revertVersion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { id, versionId } = req.params;

    // Verify edit access
    const file = await fileService.renameFile(id, '', userId, role).catch((e) => {
      if (e.message.includes('rename')) throw e;
    }); // Just a check helper, or direct service check:

    const updatedFile = await versionService.revertToVersion(id, versionId, userId);

    res.status(200).json({
      status: 'success',
      data: { file: updatedFile }
    });
  } catch (error) {
    next(error);
  }
};

export const listFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;

    const {
      search,
      extension,
      folderId,
      projectId,
      taskId,
      mimeTypeGroup,
      isDeleted,
      recentlyUploaded,
      largeFiles,
      page = 1,
      limit = 20
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const actualFolderId = folderId === 'root' || !folderId ? null : folderId === undefined ? undefined : String(folderId);

    const result = await fileService.listFiles(
      {
        search: search ? String(search) : undefined,
        extension: extension ? String(extension) : undefined,
        folderId: actualFolderId,
        projectId: projectId ? String(projectId) : undefined,
        taskId: taskId ? String(taskId) : undefined,
        mimeTypeGroup: mimeTypeGroup ? (String(mimeTypeGroup) as any) : undefined,
        isDeleted: isDeleted === 'true',
        recentlyUploaded: recentlyUploaded === 'true',
        largeFiles: largeFiles === 'true',
        skip,
        take
      },
      userId,
      role
    );

    res.status(200).json({
      status: 'success',
      data: {
        files: result.files,
        total: result.total,
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getFileMetadata = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { id } = req.params;

    const file = await fileService.downloadFile(id, userId, role); // simple verify
    const details = await prisma.file.findUnique({
      where: { id },
      include: {
        uploader: { select: { id: true, name: true, avatar: true } }
      }
    });

    res.status(200).json({
      status: 'success',
      data: { file: details }
    });
  } catch (error) {
    next(error);
  }
};

export const getStorageUsage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;

    // Admins see total, managers see total, employees see own
    const queryUserId = role === Role.Employee ? userId : undefined;
    const size = await fileService.getStorageUsage(queryUserId);

    res.status(200).json({
      status: 'success',
      data: { size }
    });
  } catch (error) {
    next(error);
  }
};

export const grantPermission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { id } = req.params;
    const { targetUserId, permission } = req.body;

    if (!targetUserId || !permission || !Object.values(Permission).includes(permission)) {
      throw new AppError('Target User ID and valid Permission are required', 400);
    }

    const record = await fileService.grantPermission(id, targetUserId, permission, userId, role);

    res.status(200).json({
      status: 'success',
      data: { permission: record }
    });
  } catch (error) {
    next(error);
  }
};

export const revokePermission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { id, userId: targetUserId } = req.params;

    await fileService.revokePermission(id, targetUserId, userId, role);

    res.status(200).json({
      status: 'success',
      message: 'Permission revoked successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { id } = req.params;

    const list = await fileService.getPermissions(id, userId, role);

    res.status(200).json({
      status: 'success',
      data: { permissions: list }
    });
  } catch (error) {
    next(error);
  }
};
import prisma from '../config/db';
