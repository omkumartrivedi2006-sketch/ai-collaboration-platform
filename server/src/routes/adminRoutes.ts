import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { AppError } from '../utils/AppError';
import * as adminController from '../controllers/adminController';
import * as adminValidator from '../validators/adminValidator';

const router = Router();

// Middleware to restrict access to Admins only
const adminOnly = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === 'Admin') {
    return next();
  }
  return next(new AppError('Forbidden. Access restricted to Administrators only.', 403));
};

// Protect all admin routes
router.use(protect);
router.use(adminOnly);

// Dashboard
router.get('/dashboard', adminController.getDashboardOverview);

// User Management
router.get('/users', adminController.getUsers);
router.post('/users', adminValidator.validateCreateUser, adminController.createUser);
router.put('/users/:id', adminValidator.validateUpdateUser, adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.patch('/users/:id/reset-password', adminController.resetPassword);

// Department Management
router.get('/departments', adminController.getDepartments);
router.post('/departments', adminValidator.validateCreateDepartment, adminController.createDepartment);
router.put('/departments/:id', adminValidator.validateUpdateDepartment, adminController.updateDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);

// Invitations
router.post('/invitations', adminValidator.validateCreateInvitation, adminController.createInvitation);
router.get('/invitations', adminController.getInvitations);
router.delete('/invitations/:id', adminController.revokeInvitation);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminValidator.validateUpdateSettings, adminController.updateSettings);

// Permission Management Matrix
router.get('/permissions', adminController.getPermissionsMatrix);
router.put('/permissions/:role', adminController.updateRolePermissions);
router.post('/permissions/seed', adminController.seedPermissions);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
