import prisma from '../config/db';
import { Request } from 'express';

export const logUserAction = async (
  userId: string | null,
  action: string,
  entity: string,
  entityId: string | null = null,
  oldValue: any = null,
  newValue: any = null,
  req?: Request
) => {
  try {
    let ipAddress = null;
    let userAgent = null;

    if (req) {
      ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || null;
      userAgent = req.headers['user-agent'] || null;
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : undefined,
        newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : undefined,
        ipAddress,
        userAgent
      }
    });
  } catch (error) {
    console.error('AuditLog Recording Failed:', error);
  }
};
