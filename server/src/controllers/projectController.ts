import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/projectService';
import { Role } from '@prisma/client';

const projectService = new ProjectService();

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creatorId = req.user!.id;
    const creatorRole = req.user!.role as Role;

    const project = await projectService.createProject(req.body, creatorId, creatorRole);

    res.status(201).json({
      status: 'success',
      data: { project }
    });
  } catch (error) {
    next(error);
  }
};

export const listProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role as Role;

    const result = await projectService.listProjects(req.query, userId, userRole);

    res.status(200).json({
      status: 'success',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role as Role;

    const project = await projectService.getProjectDetails(req.params.id, userId, userRole);

    res.status(200).json({
      status: 'success',
      data: { project }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role as Role;

    const project = await projectService.updateProject(req.params.id, req.body, userId, userRole);

    res.status(200).json({
      status: 'success',
      data: { project }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role as Role;

    await projectService.deleteProject(req.params.id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const archiveProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role as Role;

    const project = await projectService.archiveProject(req.params.id, userId, userRole);

    res.status(200).json({
      status: 'success',
      data: { project }
    });
  } catch (error) {
    next(error);
  }
};

export const restoreProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role as Role;

    const project = await projectService.restoreProject(req.params.id, userId, userRole);

    res.status(200).json({
      status: 'success',
      data: { project }
    });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actionByUserId = req.user!.id;
    const actionByUserRole = req.user!.role as Role;

    const member = await projectService.addProjectMember(
      req.params.id,
      req.body.userId,
      actionByUserId,
      actionByUserRole
    );

    res.status(200).json({
      status: 'success',
      data: { member }
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actionByUserId = req.user!.id;
    const actionByUserRole = req.user!.role as Role;

    await projectService.removeProjectMember(
      req.params.id,
      req.params.userId,
      actionByUserId,
      actionByUserRole
    );

    res.status(200).json({
      status: 'success',
      message: 'Member removed from project successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const changeManager = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actionByUserId = req.user!.id;
    const actionByUserRole = req.user!.role as Role;

    const project = await projectService.changeProjectManager(
      req.params.id,
      req.body.managerId,
      actionByUserId,
      actionByUserRole
    );

    res.status(200).json({
      status: 'success',
      data: { project }
    });
  } catch (error) {
    next(error);
  }
};

export const getMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role as Role;

    const members = await projectService.getProjectMembers(req.params.id, userId, userRole);

    res.status(200).json({
      status: 'success',
      data: { members }
    });
  } catch (error) {
    next(error);
  }
};

export const getActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role as Role;

    const activities = await projectService.getProjectActivities(req.params.id, userId, userRole);

    res.status(200).json({
      status: 'success',
      data: { activities }
    });
  } catch (error) {
    next(error);
  }
};
