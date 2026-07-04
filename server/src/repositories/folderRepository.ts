import prisma from '../config/db';
import { Folder, Prisma } from '@prisma/client';

export class FolderRepository {
  async create(data: Prisma.FolderUncheckedCreateInput): Promise<Folder> {
    return prisma.folder.create({ data });
  }

  async findById(id: string): Promise<Folder | null> {
    return prisma.folder.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true, role: true, avatar: true }
        },
        parent: true
      }
    });
  }

  async findByNameInFolder(
    name: string,
    parentId: string | null,
    projectId: string | null
  ): Promise<Folder | null> {
    return prisma.folder.findFirst({
      where: {
        name,
        parentId: parentId || null,
        projectId: projectId || null
      }
    });
  }

  async update(id: string, data: Prisma.FolderUncheckedUpdateInput): Promise<Folder> {
    return prisma.folder.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Folder> {
    return prisma.folder.delete({
      where: { id }
    });
  }

  async findSubfolders(
    parentId: string | null,
    projectId: string | null
  ): Promise<Folder[]> {
    return prisma.folder.findMany({
      where: {
        parentId: parentId || null,
        projectId: projectId || null
      },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async findFolderTree(projectId: string | null): Promise<Folder[]> {
    return prisma.folder.findMany({
      where: {
        projectId: projectId || null
      },
      orderBy: { name: 'asc' }
    });
  }
}
