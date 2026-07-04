import { Request, Response, NextFunction } from 'express';
import { FolderService } from '../services/folderService';
import { Role } from '@prisma/client';

const folderService = new FolderService();

export const createFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { name, parentId, projectId } = req.body;

    const folder = await folderService.createFolder(name, parentId, projectId, userId, role);

    res.status(201).json({
      status: 'success',
      data: { folder }
    });
  } catch (error) {
    next(error);
  }
};

export const updateFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { name } = req.body;
    const { id } = req.params;

    const folder = await folderService.renameFolder(id, name, userId, role);

    res.status(200).json({
      status: 'success',
      data: { folder }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { id } = req.params;

    await folderService.deleteFolder(id, userId, role);

    res.status(200).json({
      status: 'success',
      message: 'Folder deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getFolderContents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { id } = req.params; // id of the folder (optional, can be null/undefined for root)
    const { projectId } = req.query;

    const actualFolderId = id === 'root' || !id ? null : id;
    const actualProjectId = projectId ? String(projectId) : null;

    const contents = await folderService.getFolderContents(
      actualFolderId,
      actualProjectId,
      userId,
      role
    );

    res.status(200).json({
      status: 'success',
      data: contents
    });
  } catch (error) {
    next(error);
  }
};

export const getFolderTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { projectId } = req.query;

    const actualProjectId = projectId ? String(projectId) : null;

    const tree = await folderService.getFolderTree(actualProjectId, userId, role);

    res.status(200).json({
      status: 'success',
      data: { folders: tree }
    });
  } catch (error) {
    next(error);
  }
};
