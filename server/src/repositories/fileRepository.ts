import prisma from '../config/db';
import { File, Prisma } from '@prisma/client';

export class FileRepository {
  async create(data: Prisma.FileUncheckedCreateInput): Promise<File> {
    return prisma.file.create({ data });
  }

  async findById(id: string): Promise<any | null> {
    return prisma.file.findUnique({
      where: { id },
      include: {
        uploader: {
          select: { id: true, name: true, email: true, role: true, avatar: true }
        },
        permissions: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          }
        },
        versions: {
          orderBy: { version: 'desc' },
          include: {
            uploader: {
              select: { id: true, name: true, avatar: true }
            }
          }
        }
      }
    });
  }

  async findByNameInFolder(
    name: string,
    folderId: string | null,
    projectId: string | null,
    taskId: string | null
  ): Promise<File | null> {
    return prisma.file.findFirst({
      where: {
        name,
        folderId: folderId || null,
        projectId: projectId || null,
        taskId: taskId || null,
        isDeleted: false
      }
    });
  }

  async update(id: string, data: Prisma.FileUncheckedUpdateInput): Promise<File> {
    return prisma.file.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<File> {
    // Hard delete
    return prisma.file.delete({
      where: { id }
    });
  }

  async findAll(params: {
    search?: string;
    extension?: string;
    folderId?: string | null;
    projectId?: string | null;
    taskId?: string | null;
    mimeTypeGroup?: 'images' | 'documents' | 'videos' | 'audio' | 'archives';
    isDeleted?: boolean;
    recentlyUploaded?: boolean;
    largeFiles?: boolean;
    skip: number;
    take: number;
    userId?: string;
    role?: string;
  }): Promise<{ files: any[]; total: number }> {
    const {
      search,
      extension,
      folderId,
      projectId,
      taskId,
      mimeTypeGroup,
      isDeleted = false,
      recentlyUploaded = false,
      largeFiles = false,
      skip,
      take,
      userId,
      role
    } = params;

    const where: Prisma.FileWhereInput = {
      isDeleted
    };

    // Filters for folder/project/task
    if (folderId !== undefined) {
      where.folderId = folderId;
    }
    if (projectId) {
      where.projectId = projectId;
    }
    if (taskId) {
      where.taskId = taskId;
    }

    // Role-based visibility scoping
    if (role === 'Employee' && userId) {
      // Employees see files they uploaded, files shared with them, or project files they belong to
      where.OR = [
        { uploadedBy: userId },
        {
          permissions: {
            some: {
              userId
            }
          }
        },
        ...(projectId ? [] : [
          {
            project: {
              members: {
                some: {
                  userId
                }
              }
            }
          }
        ])
      ];
    }

    // Search by name
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Search by extension
    if (extension) {
      where.extension = {
        equals: extension.toLowerCase().replace('.', '')
      };
    }

    // MIME type filtering
    if (mimeTypeGroup) {
      if (mimeTypeGroup === 'images') {
        where.mimeType = { startsWith: 'image/' };
      } else if (mimeTypeGroup === 'documents') {
        where.mimeType = {
          in: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/csv'
          ]
        };
      } else if (mimeTypeGroup === 'videos') {
        where.mimeType = { startsWith: 'video/' };
      } else if (mimeTypeGroup === 'audio') {
        where.mimeType = { startsWith: 'audio/' };
      } else if (mimeTypeGroup === 'archives') {
        where.mimeType = {
          in: ['application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed', 'application/x-tar']
        };
      }
    }

    // Recently uploaded (last 7 days)
    if (recentlyUploaded) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      where.createdAt = {
        gte: sevenDaysAgo
      };
    }

    // Large files (> 10 MB)
    if (largeFiles) {
      where.size = {
        gt: 10 * 1024 * 1024 // 10MB in bytes
      };
    }

    const [files, total] = await prisma.$transaction([
      prisma.file.findMany({
        where,
        include: {
          uploader: {
            select: { id: true, name: true, avatar: true }
          },
          project: {
            select: { id: true, name: true, code: true }
          },
          task: {
            select: { id: true, title: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take
      }),
      prisma.file.count({ where })
    ]);

    return { files, total };
  }

  async getStorageUsage(userId?: string): Promise<number> {
    const where: Prisma.FileWhereInput = {
      isDeleted: false
    };

    if (userId) {
      where.uploadedBy = userId;
    }

    const aggregations = await prisma.file.aggregate({
      where,
      _sum: {
        size: true
      }
    });

    return aggregations._sum.size || 0;
  }
}
