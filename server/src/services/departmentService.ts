import prisma from '../config/db';
import { AppError } from '../utils/AppError';

export class DepartmentService {
  async createDepartment(name: string, description?: string, managerId?: string) {
    // Check if department name already exists
    const existing = await prisma.department.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });
    if (existing) {
      throw new AppError('A department with this name already exists', 400);
    }

    if (managerId) {
      const managerExists = await prisma.user.findUnique({ where: { id: managerId } });
      if (!managerExists) {
        throw new AppError('Assigned manager does not exist', 400);
      }
    }

    return prisma.department.create({
      data: {
        name,
        description: description || null,
        managerId: managerId || null
      },
      include: {
        manager: true
      }
    });
  }

  async getDepartments() {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        manager: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true
          }
        }
      }
    });

    // Compile department stats dynamically
    const enriched = await Promise.all(
      departments.map(async (dept) => {
        const userIds = dept.users.map(u => u.id);

        const totalTasks = await prisma.task.count({
          where: { assignedTo: { in: userIds } }
        });

        const completedTasks = await prisma.task.count({
          where: {
            assignedTo: { in: userIds },
            status: 'COMPLETED'
          }
        });

        const avgTaskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...dept,
          statistics: {
            memberCount: dept.users.length,
            totalTasks,
            completedTasks,
            avgTaskProgress
          }
        };
      })
    );

    return enriched;
  }

  async updateDepartment(id: string, name: string, description?: string, managerId?: string) {
    const dept = await prisma.department.findUnique({
      where: { id }
    });
    if (!dept) {
      throw new AppError('Department not found', 404);
    }

    // Check if name is taken by another department
    const nameConflict = await prisma.department.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        NOT: { id }
      }
    });
    if (nameConflict) {
      throw new AppError('Another department with this name already exists', 400);
    }

    if (managerId) {
      const managerExists = await prisma.user.findUnique({ where: { id: managerId } });
      if (!managerExists) {
        throw new AppError('Assigned manager does not exist', 400);
      }
    }

    const updated = await prisma.department.update({
      where: { id },
      data: {
        name,
        description: description || null,
        managerId: managerId || null
      },
      include: {
        manager: true
      }
    });

    // If manager is updated, we can also link/update the user's department fields to match
    if (managerId) {
      await prisma.user.update({
        where: { id: managerId },
        data: { departmentId: id }
      });
    }

    return updated;
  }

  async deleteDepartment(id: string) {
    const dept = await prisma.department.findUnique({
      where: { id }
    });
    if (!dept) {
      throw new AppError('Department not found', 404);
    }

    // Remove department references from all associated users
    await prisma.user.updateMany({
      where: { departmentId: id },
      data: { departmentId: null }
    });

    return prisma.department.delete({
      where: { id }
    });
  }

  async assignMembers(departmentId: string, userIds: string[]) {
    const dept = await prisma.department.findUnique({
      where: { id: departmentId }
    });
    if (!dept) {
      throw new AppError('Department not found', 404);
    }

    // Update users' departmentId
    await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { departmentId }
    });

    return { success: true };
  }
}
