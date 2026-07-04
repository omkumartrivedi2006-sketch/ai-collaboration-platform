import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import prisma from '../config/db';
import { Role } from '@prisma/client';

export const hasPermission = (moduleName: string, actionName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('Unauthorized', 401));
      }

      const { role } = req.user;

      // Admins automatically bypass permission checks
      if (role === 'Admin') {
        return next();
      }

      // Check if there is an active RolePermission mapping
      const rolePermissionMapping = await prisma.rolePermission.findFirst({
        where: {
          role: role as Role,
          permission: {
            module: moduleName,
            name: actionName
          }
        }
      });

      if (!rolePermissionMapping) {
        return next(new AppError(`Forbidden. You do not have permissions to perform "${actionName}" on module "${moduleName}"`, 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
