import prisma from '../config/db';
import { FilePermission, Permission, Prisma } from '@prisma/client';

export class FilePermissionRepository {
  async upsert(fileId: string, userId: string, permission: Permission): Promise<FilePermission> {
    return prisma.filePermission.upsert({
      where: {
        fileId_userId: {
          fileId,
          userId
        }
      },
      update: {
        permission
      },
      create: {
        fileId,
        userId,
        permission
      }
    });
  }

  async delete(fileId: string, userId: string): Promise<FilePermission> {
    return prisma.filePermission.delete({
      where: {
        fileId_userId: {
          fileId,
          userId
        }
      }
    });
  }

  async findByFileId(fileId: string): Promise<FilePermission[]> {
    return prisma.filePermission.findMany({
      where: { fileId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });
  }
}
