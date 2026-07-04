import prisma from '../config/db';
import { FileVersion, Prisma } from '@prisma/client';

export class FileVersionRepository {
  async create(data: Prisma.FileVersionUncheckedCreateInput): Promise<FileVersion> {
    return prisma.fileVersion.create({ data });
  }

  async findByFileId(fileId: string): Promise<FileVersion[]> {
    return prisma.fileVersion.findMany({
      where: { fileId },
      orderBy: { version: 'desc' },
      include: {
        uploader: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });
  }

  async findById(id: string): Promise<FileVersion | null> {
    return prisma.fileVersion.findUnique({
      where: { id }
    });
  }
}
