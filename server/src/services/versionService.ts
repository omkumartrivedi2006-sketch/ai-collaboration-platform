import prisma from '../config/db';
import { AppError } from '../utils/AppError';
import { FileVersion } from '@prisma/client';

export class VersionService {
  async createVersion(
    fileId: string,
    publicId: string,
    url: string,
    uploadedBy: string,
    versionNumber: number
  ): Promise<FileVersion> {
    return prisma.fileVersion.create({
      data: {
        fileId,
        publicId,
        url,
        uploadedBy,
        version: versionNumber
      }
    });
  }

  async getVersionHistory(fileId: string): Promise<FileVersion[]> {
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

  async revertToVersion(fileId: string, versionId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const file = await tx.file.findUnique({
        where: { id: fileId },
        include: { versions: true }
      });

      if (!file) {
        throw new AppError('File not found', 404);
      }

      const versionToRevert = await tx.fileVersion.findFirst({
        where: { id: versionId, fileId }
      });

      if (!versionToRevert) {
        throw new AppError('Version not found for this file', 404);
      }

      // Increment version number of the main file
      const nextVersionNumber = file.version + 1;

      // Update main file with version details
      const updatedFile = await tx.file.update({
        where: { id: fileId },
        data: {
          publicId: versionToRevert.publicId,
          url: versionToRevert.url,
          version: nextVersionNumber,
          uploadedBy: userId
        }
      });

      // Create new FileVersion record for the promoted version
      await tx.fileVersion.create({
        data: {
          fileId,
          publicId: versionToRevert.publicId,
          url: versionToRevert.url,
          uploadedBy: userId,
          version: nextVersionNumber
        }
      });

      return updatedFile;
    });
  }
}
