import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/adminService';
import { DepartmentService } from '../services/departmentService';
import { InvitationService } from '../services/invitationService';
import { logUserAction } from '../middleware/auditMiddleware';
import { AppError } from '../utils/AppError';
import { Role } from '@prisma/client';
import { validationResult } from 'express-validator';
import prisma from '../config/db';

const adminService = new AdminService();
const departmentService = new DepartmentService();
const invitationService = new InvitationService();

const checkValidation = (req: Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }
};

// Dashboard Overview
export const getDashboardOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getDashboardOverview();
    res.status(200).json({ status: 'success', data: stats });
  } catch (error) {
    next(error);
  }
};

// User Management
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, role, departmentId, isActive, page, limit } = req.query;
    const filters = {
      search: search as string,
      role: role as Role,
      departmentId: departmentId as string,
      isActive: isActive !== undefined ? isActive === 'true' : undefined
    };

    const result = await adminService.getUsers(
      filters,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 10
    );

    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    checkValidation(req);
    const user = await adminService.createUser(req.body);

    // Audit Log
    await logUserAction(req.user!.id, 'User Created', 'User', user.id, null, user, req);

    res.status(201).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    checkValidation(req);
    const { id } = req.params;
    
    const originalUser = await prisma?.user.findUnique({ where: { id } });
    const user = await adminService.updateUser(id, req.body);

    // Audit Role changes specifically
    if (originalUser && originalUser.role !== user.role) {
      await logUserAction(req.user!.id, 'Role Changed', 'User', user.id, { role: originalUser.role }, { role: user.role }, req);
    } else {
      await logUserAction(req.user!.id, 'User Updated', 'User', user.id, originalUser, user, req);
    }

    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await adminService.deleteUser(id);

    await logUserAction(req.user!.id, 'User Deleted', 'User', id, user, null, req);

    res.status(200).json({ status: 'success', message: 'User permanently deleted' });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const result = await adminService.toggleUserStatus(id, isActive);
    const action = isActive ? 'User Activated' : 'User Deactivated';
    
    await logUserAction(req.user!.id, action, 'User', id, null, result, req);

    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return next(new AppError('Password must be at least 6 characters', 400));
    }

    await adminService.resetPassword(id, password);

    await logUserAction(req.user!.id, 'User Password Reset', 'User', id, null, null, req);

    res.status(200).json({ status: 'success', message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

// Department Management
export const getDepartments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const departments = await departmentService.getDepartments();
    res.status(200).json({ status: 'success', data: { departments } });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    checkValidation(req);
    const { name, description, managerId } = req.body;
    const dept = await departmentService.createDepartment(name, description, managerId);

    await logUserAction(req.user!.id, 'Department Created', 'Department', dept.id, null, dept, req);

    res.status(201).json({ status: 'success', data: { department: dept } });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    checkValidation(req);
    const { id } = req.params;
    const { name, description, managerId } = req.body;

    const originalDept = await prisma?.department.findUnique({ where: { id } });
    const dept = await departmentService.updateDepartment(id, name, description, managerId);

    await logUserAction(req.user!.id, 'Department Updated', 'Department', id, originalDept, dept, req);

    res.status(200).json({ status: 'success', data: { department: dept } });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const dept = await departmentService.deleteDepartment(id);

    await logUserAction(req.user!.id, 'Department Deleted', 'Department', id, dept, null, req);

    res.status(200).json({ status: 'success', message: 'Department successfully deleted' });
  } catch (error) {
    next(error);
  }
};

// Invitations
export const createInvitation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    checkValidation(req);
    const { email, role, departmentId } = req.body;
    const invitation = await invitationService.createInvitation(email, role as Role, departmentId);

    await logUserAction(req.user!.id, 'Invitation Sent', 'Invitation', invitation.id, null, { email, role }, req);

    res.status(201).json({ status: 'success', data: { invitation } });
  } catch (error) {
    next(error);
  }
};

export const getInvitations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invitations = await invitationService.getInvitations();
    res.status(200).json({ status: 'success', data: { invitations } });
  } catch (error) {
    next(error);
  }
};

export const revokeInvitation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await invitationService.revokeInvitation(id);

    await logUserAction(req.user!.id, 'Invitation Revoked', 'Invitation', id, null, null, req);

    res.status(200).json({ status: 'success', message: 'Invitation revoked successfully' });
  } catch (error) {
    next(error);
  }
};

export const validateInvitationToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const invite = await invitationService.validateToken(token);
    res.status(200).json({ status: 'success', data: { invitation: invite } });
  } catch (error) {
    next(error);
  }
};

// Settings
export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await adminService.getOrganizationSettings();
    res.status(200).json({ status: 'success', data: { settings } });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    checkValidation(req);
    const originalSettings = await adminService.getOrganizationSettings();
    const settings = await adminService.updateOrganizationSettings(req.body);

    await logUserAction(req.user!.id, 'Settings Changed', 'Organization', settings.id, originalSettings, settings, req);

    res.status(200).json({ status: 'success', data: { settings } });
  } catch (error) {
    next(error);
  }
};

// Permission Matrix & Seed
export const getPermissionsMatrix = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matrix = await adminService.getPermissionsMatrix();
    res.status(200).json({ status: 'success', data: matrix });
  } catch (error) {
    next(error);
  }
};

export const updateRolePermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.params;
    const { permissionIds } = req.body;

    if (!permissionIds || !Array.isArray(permissionIds)) {
      return next(new AppError('permissionIds array is required', 400));
    }

    await adminService.updateRolePermissions(role as Role, permissionIds);

    await logUserAction(req.user!.id, 'Permission Updated', 'RolePermission', null, { role }, { permissionIds }, req);

    res.status(200).json({ status: 'success', message: 'Permissions mapping updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const seedPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await adminService.seedDefaultPermissions();
    res.status(200).json({ status: 'success', message: 'Default permissions seeded' });
  } catch (error) {
    next(error);
  }
};

// Audit logs
export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, entity, search, startDate, endDate, page, limit } = req.query;
    const filters = {
      userId: userId as string,
      entity: entity as string,
      search: search as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined
    };

    const result = await adminService.getAuditLogs(
      filters,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20
    );

    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};
