import { Request, Response, NextFunction } from 'express';
import { AnalyticsService, AnalyticsFilter } from '../services/analyticsService';
import { AppError } from '../utils/AppError';
import { TaskStatus, TaskPriority, Role } from '@prisma/client';

const analyticsService = new AnalyticsService();

const parseFilters = (req: Request): AnalyticsFilter => {
  const { startDate, endDate, projectId, department, employeeId, status, priority } = req.query;
  
  const filters: AnalyticsFilter = {};
  if (startDate) filters.startDate = new Date(startDate as string);
  if (endDate) filters.endDate = new Date(endDate as string);
  if (projectId) filters.projectId = projectId as string;
  if (department) filters.department = department as string;
  if (employeeId) filters.employeeId = employeeId as string;
  if (status) filters.status = status as TaskStatus;
  if (priority) filters.priority = priority as TaskPriority;

  return filters;
};

export const getDashboardOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const filters = parseFilters(req);

    const stats = await analyticsService.getDashboardOverview(userId, role, filters);

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const filters = parseFilters(req);

    const projectStats = await analyticsService.getProjectAnalytics(userId, role, filters);

    res.status(200).json({
      status: 'success',
      data: projectStats
    });
  } catch (error) {
    next(error);
  }
};

export const getTeamAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const filters = parseFilters(req);

    // Employees cannot see team workloads unless they are Admin or Manager
    if (role !== 'Admin' && role !== 'Manager') {
      return next(new AppError('Forbidden. Only Admin and Managers can access team workload distributions.', 403));
    }

    const teamStats = await analyticsService.getTeamAnalytics(userId, role, filters);

    res.status(200).json({
      status: 'success',
      data: teamStats
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const filters = parseFilters(req);

    const employeeStats = await analyticsService.getEmployeeAnalytics(userId, role, filters);

    res.status(200).json({
      status: 'success',
      data: employeeStats
    });
  } catch (error) {
    next(error);
  }
};

export const getMeetingAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const filters = parseFilters(req);

    const meetingStats = await analyticsService.getMeetingAnalytics(userId, role, filters);

    res.status(200).json({
      status: 'success',
      data: meetingStats
    });
  } catch (error) {
    next(error);
  }
};

export const getAIAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const filters = parseFilters(req);

    const aiStats = await analyticsService.getAIAnalytics(userId, role, filters);

    res.status(200).json({
      status: 'success',
      data: aiStats
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardOverview,
  getProjectAnalytics,
  getTeamAnalytics,
  getEmployeeAnalytics,
  getMeetingAnalytics,
  getAIAnalytics
};
