import prisma from '../config/db';
import { Role, Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcrypt';

export interface UserFilter {
  search?: string;
  role?: Role;
  departmentId?: string;
  isActive?: boolean;
}

export interface AuditFilter {
  userId?: string;
  entity?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export class AdminService {
  async getDashboardOverview() {
    const [
      totalUsers,
      activeUsers,
      totalProjects,
      totalTasks,
      totalMeetings,
      totalDepartments,
      pendingInvites
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.project.count(),
      prisma.task.count(),
      prisma.meeting.count(),
      prisma.department.count(),
      prisma.invitation.count({ where: { status: 'PENDING', expiresAt: { gt: new Date() } } })
    ]);

    const recentLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });

    return {
      stats: {
        totalUsers,
        activeUsers,
        totalProjects,
        totalTasks,
        totalMeetings,
        totalDepartments,
        pendingInvites
      },
      recentLogs
    };
  }

  async getUsers(filters: UserFilter, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.UserWhereInput = {};

    if (filters.isActive !== undefined) {
      whereClause.isActive = filters.isActive;
    }

    if (filters.role) {
      whereClause.role = filters.role;
    }

    if (filters.departmentId) {
      whereClause.departmentId = filters.departmentId;
    }

    if (filters.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        include: {
          memberDepartment: {
            select: { id: true, name: true }
          }
        }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    // Format output to remove raw password hashes
    const sanitized = users.map(({ password, ...rest }) => rest);

    return {
      users: sanitized,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async createUser(data: any) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });
    if (existing) {
      throw new AppError('Email is already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password || 'TemporaryPassword123!', 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || Role.Employee,
        departmentId: data.departmentId || null,
        designation: data.designation || null,
        phone: data.phone || null,
        avatar: data.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(data.name)}`
      },
      include: {
        memberDepartment: true
      }
    });

    const { password, ...sanitized } = user;
    return sanitized;
  }

  async updateUser(id: string, data: any) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (data.email && data.email !== user.email) {
      const emailConflict = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailConflict) {
        throw new AppError('Email is already taken by another user', 400);
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        departmentId: data.departmentId || null,
        designation: data.designation,
        phone: data.phone,
        avatar: data.avatar
      },
      include: {
        memberDepartment: true
      }
    });

    const { password, ...sanitized } = updated;
    return sanitized;
  }

  async toggleUserStatus(id: string, isActive: boolean) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, email: true, isActive: true }
    });
  }

  async resetPassword(id: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    return { success: true };
  }

  async deleteUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return prisma.user.delete({
      where: { id }
    });
  }

  async getAuditLogs(filters: AuditFilter, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const whereClause: Prisma.AuditLogWhereInput = {};

    if (filters.userId) {
      whereClause.userId = filters.userId;
    }

    if (filters.entity) {
      whereClause.entity = filters.entity;
    }

    if (filters.search) {
      whereClause.action = { contains: filters.search, mode: 'insensitive' };
    }

    if (filters.startDate || filters.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) {
        whereClause.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        whereClause.createdAt.lte = filters.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      }),
      prisma.auditLog.count({ where: whereClause })
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getOrganizationSettings() {
    let org = await prisma.organization.findFirst({
      include: { departments: true }
    });

    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: 'Workspace Organization',
          logo: null,
          website: null,
          industry: null,
          address: null,
          phone: null,
          email: null,
          timezone: 'UTC',
          language: 'en',
          brandColors: '#4f46e5',
          workingDays: 'Monday,Tuesday,Wednesday,Thursday,Friday',
          workingHours: '09:00-17:00'
        },
        include: { departments: true }
      });
    }

    return org;
  }

  async updateOrganizationSettings(data: any) {
    const org = await this.getOrganizationSettings();

    return prisma.organization.update({
      where: { id: org.id },
      data: {
        name: data.name,
        logo: data.logo,
        website: data.website,
        industry: data.industry,
        address: data.address,
        phone: data.phone,
        email: data.email,
        timezone: data.timezone,
        language: data.language,
        brandColors: data.brandColors,
        workingDays: data.workingDays,
        workingHours: data.workingHours
      }
    });
  }

  // Permissions matrices actions
  async getPermissionsMatrix() {
    const [permissions, mappings] = await Promise.all([
      prisma.systemPermission.findMany({
        orderBy: [{ module: 'asc' }, { name: 'asc' }]
      }),
      prisma.rolePermission.findMany({
        include: { permission: true }
      })
    ]);

    return { permissions, mappings };
  }

  async seedDefaultPermissions() {
    const defaultPerms = [
      { module: 'Project', name: 'Read', description: 'Can view project boards' },
      { module: 'Project', name: 'Create', description: 'Can build new project workspaces' },
      { module: 'Project', name: 'Update', description: 'Can modify project configurations' },
      { module: 'Project', name: 'Delete', description: 'Can delete projects' },
      { module: 'Task', name: 'Read', description: 'Can view project backlog tasks' },
      { module: 'Task', name: 'Create', description: 'Can create new task cards' },
      { module: 'Task', name: 'Update', description: 'Can edit tasks status/assignments' },
      { module: 'Task', name: 'Delete', description: 'Can delete task cards' },
      { module: 'Meeting', name: 'Read', description: 'Can view meetings list' },
      { module: 'Meeting', name: 'Create', description: 'Can schedule new synchronization meetings' }
    ];

    for (const p of defaultPerms) {
      await prisma.systemPermission.upsert({
        where: { name: p.name + '_' + p.module }, // unique constraint fallback
        create: {
          name: p.name + '_' + p.module, // unique name string e.g. "Read_Project"
          description: p.description,
          module: p.module
        },
        update: {}
      });
    }

    // Auto-seed Administrator full access
    const allPermissions = await prisma.systemPermission.findMany();
    for (const perm of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          role_permissionId: {
            role: Role.Admin,
            permissionId: perm.id
          }
        },
        create: {
          role: Role.Admin,
          permissionId: perm.id
        },
        update: {}
      });
    }
  }

  async updateRolePermissions(role: Role, permissionIds: string[]) {
    // 1. Remove all existing permissions for this role (except Admin which stays with all access)
    if (role === Role.Admin) {
      throw new AppError('Cannot modify Admin permissions matrix', 400);
    }

    await prisma.rolePermission.deleteMany({
      where: { role }
    });

    // 2. Add new mappings
    const mappings = permissionIds.map(pId => ({
      role,
      permissionId: pId
    }));

    if (mappings.length > 0) {
      await prisma.rolePermission.createMany({
        data: mappings
      });
    }

    return { success: true };
  }
}
