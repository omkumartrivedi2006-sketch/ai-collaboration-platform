import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/taskService';
import { Role, TaskStatus, TaskPriority } from '@prisma/client';
import { AppError } from '../utils/AppError';

import { FileService } from '../services/fileService';
import prisma from '../config/db';

const taskService = new TaskService();
const fileService = new FileService();

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creatorId = req.user!.id;
    const creatorRole = req.user!.role as Role;

    const task = await taskService.createTask(req.body, creatorId, creatorRole);

    res.status(201).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

export const listTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;

    const result = await taskService.listTasks(req.query, userId, role);

    res.status(200).json({
      status: 'success',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;

    const result = await taskService.getTaskDetails(req.params.id, userId, role);

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;

    const task = await taskService.updateTask(req.params.id, req.body, userId, role);

    res.status(200).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { status } = req.body;

    if (!status || !Object.values(TaskStatus).includes(status)) {
      throw new AppError('Invalid task status', 400);
    }

    const task = await taskService.updateTaskStatus(req.params.id, status as TaskStatus, userId, role);

    res.status(200).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskPriority = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { priority } = req.body;

    if (!priority || !Object.values(TaskPriority).includes(priority)) {
      throw new AppError('Invalid task priority', 400);
    }

    const task = await taskService.updateTaskPriority(req.params.id, priority as TaskPriority, userId, role);

    res.status(200).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

export const archiveTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;

    const task = await taskService.archiveTask(req.params.id, userId, role);

    res.status(200).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

export const restoreTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;

    const task = await taskService.restoreTask(req.params.id, userId, role);

    res.status(200).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;

    await taskService.deleteTask(req.params.id, userId, role);

    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { comment } = req.body;

    const newComment = await taskService.addComment(req.params.id, comment, userId, role);

    res.status(201).json({
      status: 'success',
      data: { comment: newComment }
    });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { comment } = req.body;

    const updatedComment = await taskService.updateComment(req.params.id, comment, userId, role);

    res.status(200).json({
      status: 'success',
      data: { comment: updatedComment }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;

    await taskService.deleteComment(req.params.id, userId, role);

    res.status(200).json({
      status: 'success',
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const addAttachment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;

    if (!req.file) {
      throw new AppError('File upload payload is required', 400);
    }

    const task = await prisma.task.findUnique({
      where: { id: req.params.id }
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // 1. Upload file through the Enterprise File Service
    const file = await fileService.uploadFile(
      req.file,
      null, // auto-generated folder structure will be used
      task.projectId,
      task.id,
      userId,
      role
    );

    // 2. Also add attachment record to traditional TaskAttachment for compatibility
    const attachment = await taskService.addAttachment(
      req.params.id,
      userId,
      file.name,
      file.url,
      file.mimeType,
      role
    );

    res.status(201).json({
      status: 'success',
      data: { attachment }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAttachment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;

    await taskService.deleteAttachment(req.params.id, userId, role);

    res.status(200).json({
      status: 'success',
      message: 'Attachment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;

    const activities = await taskService.getTaskActivities(req.params.id, userId, role);

    res.status(200).json({
      status: 'success',
      data: { activities }
    });
  } catch (error) {
    next(error);
  }
};
